import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CustomerSnapshot,
  OrderEntity,
  OrderItem,
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  ORDER_STATUSES,
} from './entities/order.entity';
import { VouchersService } from '../vouchers/vouchers.service';

const ORDER_STATUS_VALUES = [...ORDER_STATUSES];
const PAYMENT_STATUS_VALUES = [...PAYMENT_STATUSES];
const PAYMENT_METHOD_VALUES = [...PAYMENT_METHODS];

type RawOrderItem = {
  productId?: string;
  product?: { id?: string; _id?: string; name?: string; image?: string };
  productName?: string;
  productImage?: string;
  quantity?: number | string;
  price?: number | string;
  unitPrice?: number | string;
  lineTotal?: number | string;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    private readonly vouchersService: VouchersService,
  ) {}

  private normaliseItems(rawItems: any): OrderItem[] {
    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems
      .map((raw: RawOrderItem) => {
        const productId =
          raw.productId ||
          raw.product?.id ||
          (raw.product?._id as string) ||
          (raw.product && typeof (raw.product as any)._id?.toString === 'function'
            ? (raw.product as any)._id.toString()
            : undefined);

        const quantity = Number(raw.quantity ?? (raw as any).qty ?? 0);
        const price = Number(raw.price ?? raw.unitPrice ?? 0);
        const lineTotal = Number(
          raw.lineTotal ?? (Number.isFinite(price) ? price * quantity : 0),
        );

        if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
          return null;
        }

        const safePrice = Number.isFinite(price) ? price : 0;
        const safeLineTotal = Number.isFinite(lineTotal)
          ? lineTotal
          : Math.max(safePrice * quantity, 0);

        return {
          productId,
          productName: raw.productName || raw.product?.name,
          productImage: raw.productImage || raw.product?.image,
          quantity,
          price: safePrice,
          lineTotal: safeLineTotal,
        };
      })
      .filter(Boolean) as OrderItem[];
  }

  private resolveStatus(value?: string): OrderStatusValue {
    if (value && ORDER_STATUS_VALUES.includes(value as OrderStatusValue)) {
      return value as OrderStatusValue;
    }
    return 'pending_confirmation';
  }

  private resolvePaymentMethod(value?: string): PaymentMethodValue {
    if (value && PAYMENT_METHOD_VALUES.includes(value as PaymentMethodValue)) {
      return value as PaymentMethodValue;
    }
    return 'paid_online';
  }

  private resolvePaymentStatus(
    value: string | undefined,
    method: PaymentMethodValue,
  ): PaymentStatusValue {
    if (value && PAYMENT_STATUS_VALUES.includes(value as PaymentStatusValue)) {
      return value as PaymentStatusValue;
    }
    return method === 'cod' ? 'pending' : 'paid';
  }

  private resolveShippingAddress(payload: any): Record<string, any> | undefined {
    if (payload && typeof payload === 'object') {
      return payload;
    }
    return undefined;
  }

  private resolveShippingAddressText(dto: any): string | undefined {
    if (typeof dto?.shippingAddressText === 'string') {
      return dto.shippingAddressText;
    }
    if (typeof dto?.shippingAddress === 'string') {
      return dto.shippingAddress;
    }
    return undefined;
  }

  private resolveCustomerSnapshot(payload: any): CustomerSnapshot | undefined {
    if (payload && typeof payload === 'object') {
      const snapshot: CustomerSnapshot = {};
      if (typeof payload.name === 'string') snapshot.name = payload.name;
      if (typeof payload.email === 'string') snapshot.email = payload.email;
      if (typeof payload.phone === 'string') snapshot.phone = payload.phone;
      return snapshot;
    }
    return undefined;
  }

  private computeTotalAmount(
    dto: any,
    items: OrderItem[],
  ): number {
    if (dto?.totalAmount != null && Number.isFinite(Number(dto.totalAmount))) {
      return Number(dto.totalAmount);
    }
    return items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  }

  async create(createOrderDto: any): Promise<OrderEntity> {
    const items = this.normaliseItems(createOrderDto?.items);
    if (!items.length) {
      throw new BadRequestException('Order must contain at least one product');
    }

    const userId = createOrderDto?.userId;
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const status = this.resolveStatus(createOrderDto?.status);
    const paymentMethod = this.resolvePaymentMethod(
      createOrderDto?.paymentMethod || createOrderDto?.paymentInfo?.method,
    );
    const paymentStatus = this.resolvePaymentStatus(
      createOrderDto?.paymentStatus || createOrderDto?.paymentInfo?.status,
      paymentMethod,
    );

    const totalAmount = this.computeTotalAmount(createOrderDto, items);

    const paymentInfo = {
      method: paymentMethod,
      status: paymentStatus,
      transactionId:
        createOrderDto?.paymentInfo?.transactionId || createOrderDto?.transactionId || undefined,
    };

    const customerSnapshot =
      this.resolveCustomerSnapshot(createOrderDto?.customerSnapshot) ??
      this.resolveCustomerSnapshot(createOrderDto?.customer);

    const order = this.ordersRepository.create({
      userId,
      items,
      totalAmount,
      status,
      paymentMethod,
      paymentStatus,
      paymentInfo,
      customerSnapshot,
      shippingAddress: this.resolveShippingAddress(createOrderDto?.shippingAddress),
      shippingAddressText: this.resolveShippingAddressText(createOrderDto),
      notes: createOrderDto?.notes ?? createOrderDto?.note,
      confirmedAt: createOrderDto?.confirmedAt ? new Date(createOrderDto.confirmedAt) : null,
    });

    const savedOrder = await this.ordersRepository.save(order);
    await this.vouchersService.issueRewardForOrder(savedOrder);
    return savedOrder;
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<OrderEntity | null> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    return order ?? null;
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    return this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateOrderDto: any): Promise<OrderEntity | null> {
    const existing = await this.ordersRepository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    if (updateOrderDto?.items) {
      const items = this.normaliseItems(updateOrderDto.items);
      if (!items.length) {
        throw new BadRequestException('Order must contain at least one product');
      }
      existing.items = items;
      existing.totalAmount = this.computeTotalAmount(updateOrderDto, items);
    } else if (updateOrderDto?.totalAmount != null && Number.isFinite(Number(updateOrderDto.totalAmount))) {
      existing.totalAmount = Number(updateOrderDto.totalAmount);
    }

    if (updateOrderDto?.status) {
      existing.status = this.resolveStatus(updateOrderDto.status);
    }

    if (updateOrderDto?.paymentMethod) {
      existing.paymentMethod = this.resolvePaymentMethod(updateOrderDto.paymentMethod);
    }

    if (updateOrderDto?.paymentStatus) {
      existing.paymentStatus = this.resolvePaymentStatus(
        updateOrderDto.paymentStatus,
        existing.paymentMethod,
      );
    }

    if (updateOrderDto?.paymentInfo) {
      existing.paymentInfo = {
        method: this.resolvePaymentMethod(updateOrderDto.paymentInfo.method),
        status: this.resolvePaymentStatus(
          updateOrderDto.paymentInfo.status,
          existing.paymentMethod,
        ),
        transactionId: updateOrderDto.paymentInfo.transactionId,
      };
    }

    if (updateOrderDto?.shippingAddress && typeof updateOrderDto.shippingAddress === 'object') {
      existing.shippingAddress = updateOrderDto.shippingAddress;
    }

    const shippingAddressText = this.resolveShippingAddressText(updateOrderDto);
    if (shippingAddressText !== undefined) {
      existing.shippingAddressText = shippingAddressText;
    }

    if (
      updateOrderDto?.customerSnapshot &&
      typeof updateOrderDto.customerSnapshot === 'object'
    ) {
      existing.customerSnapshot = this.resolveCustomerSnapshot(updateOrderDto.customerSnapshot) ?? null;
    }

    if (typeof updateOrderDto?.notes === 'string') {
      existing.notes = updateOrderDto.notes;
    }

    const savedOrder = await this.ordersRepository.save(existing);
    await this.vouchersService.issueRewardForOrder(savedOrder);
    return savedOrder;
  }

  async updateByUser(
    id: string,
    userId: string,
    payload: { shippingAddress?: string; note?: string },
  ): Promise<OrderEntity> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const order = await this.ordersRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'pending_confirmation') {
      throw new BadRequestException('Order can only be updated before confirmation');
    }

    if (typeof payload.shippingAddress === 'string') {
      order.shippingAddressText = payload.shippingAddress;
    }

    if (typeof payload.note === 'string') {
      order.notes = payload.note;
    }

    return this.ordersRepository.save(order);
  }

  async cancelByUser(id: string, userId: string): Promise<OrderEntity> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const order = await this.ordersRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'pending_confirmation') {
      throw new BadRequestException('Only orders waiting for confirmation can be cancelled');
    }

    order.status = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.paymentInfo = {
        ...(order.paymentInfo ?? {}),
        method: order.paymentMethod,
        status: 'refunded',
      };
    }

    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<OrderEntity | null> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return null;
    }
    await this.ordersRepository.remove(order);
    return order;
  }

  async updateStatus(id: string, status: string): Promise<OrderEntity | null> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return null;
    }

    const resolvedStatus = this.resolveStatus(status);
    order.status = resolvedStatus;

    if (resolvedStatus === 'confirmed' && !order.confirmedAt) {
      order.confirmedAt = new Date();
    }

    if (resolvedStatus === 'pending_confirmation') {
      order.confirmedAt = null;
    }

    if (resolvedStatus === 'cancelled' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.paymentInfo = {
        ...(order.paymentInfo ?? {}),
        method: order.paymentMethod,
        status: 'refunded',
      };
    }

    if (resolvedStatus === 'completed' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.paymentInfo = {
        ...(order.paymentInfo ?? {}),
        method: order.paymentMethod,
        status: 'paid',
      };
    }

    order.paymentInfo = {
      ...(order.paymentInfo ?? {}),
      method: order.paymentMethod,
      status: order.paymentStatus,
    };

    const savedOrder = await this.ordersRepository.save(order);
    await this.vouchersService.issueRewardForOrder(savedOrder);
    return savedOrder;
  }

  async confirmReceipt(id: string, userId: string): Promise<OrderEntity> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const order = await this.ordersRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'completed') {
      return order;
    }

    const allowedStatuses = ['shipped', 'delivered', 'processing', 'confirmed'];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException('Order is not ready for confirmation');
    }

    order.status = 'completed';

    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    const paymentStatus =
      order.paymentStatus || (order.paymentMethod === 'cod' ? 'paid' : 'paid');
    order.paymentStatus = paymentStatus;
    order.paymentInfo = {
      ...(order.paymentInfo ?? {}),
      method: order.paymentMethod,
      status: paymentStatus,
    };

    const savedOrder = await this.ordersRepository.save(order);
    await this.vouchersService.issueRewardForOrder(savedOrder);
    return savedOrder;
  }
}
