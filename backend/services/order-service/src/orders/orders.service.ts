import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  Order,
} from './schemas/order.schema';

const ORDER_STATUS_VALUES = [...ORDER_STATUSES];
const PAYMENT_STATUS_VALUES = [...PAYMENT_STATUSES];
const PAYMENT_METHOD_VALUES = [...PAYMENT_METHODS];

type OrderStatusValue = (typeof ORDER_STATUSES)[number];
type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];
type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

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
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  private normaliseItems(rawItems: any): Order['items'] {
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

        return {
          productId,
          productName: raw.productName || raw.product?.name,
          productImage: raw.productImage || raw.product?.image,
          quantity,
          price: Number.isFinite(price) ? price : 0,
          lineTotal: Number.isFinite(lineTotal) ? lineTotal : Math.max(price * quantity, 0),
        };
      })
      .filter(Boolean) as Order['items'];
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

  private resolvePaymentStatus(value: string | undefined, method: PaymentMethodValue): PaymentStatusValue {
    if (value && PAYMENT_STATUS_VALUES.includes(value as PaymentStatusValue)) {
      return value as PaymentStatusValue;
    }
    return method === 'cod' ? 'pending' : 'paid';
  }

  async create(createOrderDto: any): Promise<Order> {
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

    const totalAmount = Number.isFinite(Number(createOrderDto?.totalAmount))
      ? Number(createOrderDto.totalAmount)
      : items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

    const shippingAddress =
      createOrderDto?.shippingAddress && typeof createOrderDto.shippingAddress === 'object'
        ? createOrderDto.shippingAddress
        : undefined;

    const shippingAddressText =
      typeof createOrderDto?.shippingAddressText === 'string'
        ? createOrderDto.shippingAddressText
        : typeof createOrderDto?.shippingAddress === 'string'
        ? createOrderDto.shippingAddress
        : undefined;

    const customerSnapshot =
      createOrderDto?.customerSnapshot && typeof createOrderDto.customerSnapshot === 'object'
        ? createOrderDto.customerSnapshot
        : createOrderDto?.customer && typeof createOrderDto.customer === 'object'
        ? createOrderDto.customer
        : undefined;

    const paymentInfo = {
      method: paymentMethod,
      status: paymentStatus,
      transactionId:
        createOrderDto?.paymentInfo?.transactionId || createOrderDto?.transactionId || undefined,
    };

    const order = new this.orderModel({
      userId,
      items,
      totalAmount,
      status,
      paymentMethod,
      paymentStatus,
      paymentInfo,
      customerSnapshot,
      shippingAddress,
      shippingAddressText,
      notes: createOrderDto?.notes ?? createOrderDto?.note,
      confirmedAt: createOrderDto?.confirmedAt,
    });

    return order.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updateOrderDto: any): Promise<Order | null> {
    const updatePayload: Record<string, any> = { ...updateOrderDto, updatedAt: new Date() };

    if (updateOrderDto?.items) {
      const items = this.normaliseItems(updateOrderDto.items);
      if (!items.length) {
        throw new BadRequestException('Order must contain at least one product');
      }
      updatePayload.items = items;
      if (updateOrderDto.totalAmount == null) {
        updatePayload.totalAmount = items.reduce(
          (sum, item) => sum + (Number(item.lineTotal) || 0),
          0,
        );
      }
    }

    if (updateOrderDto?.status) {
      updatePayload.status = this.resolveStatus(updateOrderDto.status);
    }

    if (updateOrderDto?.paymentMethod) {
      updatePayload.paymentMethod = this.resolvePaymentMethod(updateOrderDto.paymentMethod);
    }

    if (updateOrderDto?.paymentStatus) {
      updatePayload.paymentStatus = this.resolvePaymentStatus(
        updateOrderDto.paymentStatus,
        updatePayload.paymentMethod || this.resolvePaymentMethod(undefined),
      );
    }

    if (updateOrderDto?.paymentInfo) {
      updatePayload.paymentInfo = {
        method: this.resolvePaymentMethod(updateOrderDto.paymentInfo.method),
        status: this.resolvePaymentStatus(
          updateOrderDto.paymentInfo.status,
          updatePayload.paymentMethod || this.resolvePaymentMethod(undefined),
        ),
        transactionId: updateOrderDto.paymentInfo.transactionId,
      };
    }

    if (updateOrderDto?.shippingAddress && typeof updateOrderDto.shippingAddress === 'object') {
      updatePayload.shippingAddress = updateOrderDto.shippingAddress;
    }

    if (typeof updateOrderDto?.shippingAddressText === 'string') {
      updatePayload.shippingAddressText = updateOrderDto.shippingAddressText;
    }

    if (
      updateOrderDto?.customerSnapshot &&
      typeof updateOrderDto.customerSnapshot === 'object'
    ) {
      updatePayload.customerSnapshot = updateOrderDto.customerSnapshot;
    }

    return this.orderModel.findByIdAndUpdate(id, updatePayload, { new: true }).exec();
  }

  async remove(id: string): Promise<Order | null> {
    return this.orderModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const resolvedStatus = this.resolveStatus(status);
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      return null;
    }

    order.status = resolvedStatus;

    if (resolvedStatus === 'confirmed' && !order.confirmedAt) {
      order.confirmedAt = new Date();
    }

    if (resolvedStatus === 'pending_confirmation') {
      order.confirmedAt = undefined;
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

    order.updatedAt = new Date();

    return order.save();
  }
}
