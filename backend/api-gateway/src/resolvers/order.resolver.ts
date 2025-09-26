import {
  Resolver,
  Query,
  Args,
  ObjectType,
  Field,
  Mutation,
  Context,
  InputType,
} from '@nestjs/graphql';
import {
  Inject,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@ObjectType()
class OrderItemType {
  @Field()
  productId: string;

  @Field()
  quantity: number;

  @Field()
  price: number;

  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  productImage?: string;

  @Field({ nullable: true })
  lineTotal?: number;
}

@ObjectType()
class OrderType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field()
  totalAmount: number;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  paymentStatus?: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  customerName?: string;

  @Field({ nullable: true })
  customerEmail?: string;

  @Field({ nullable: true })
  customerPhone?: string;

  @Field({ nullable: true })
  shippingAddress?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  confirmedAt?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@InputType()
class OrderItemInput {
  @Field()
  productId: string;

  @Field()
  quantity: number;
}

@InputType()
class CreateOrderInput {
  @Field(() => [OrderItemInput])
  items: OrderItemInput[];

  @Field({ nullable: true })
  shippingAddress?: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  paymentStatus?: string;

  @Field({ nullable: true })
  note?: string;

  @Field({ nullable: true })
  transactionId?: string;
}

@Resolver()
export class OrderResolver {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
  ) {}

  private readonly baseUrl =
    process.env.ORDER_SERVICE_URL ||
    `http://${process.env.ORDER_SERVICE_HOST || 'localhost'}:${
      process.env.ORDER_SERVICE_PORT || '3003'
    }`;

  private readonly cartBaseUrl =
    process.env.CART_SERVICE_URL ||
    `http://${process.env.CART_SERVICE_HOST || 'localhost'}:${
      process.env.CART_SERVICE_PORT || '3007'
    }`;

  private readonly productBaseUrl =
    process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

  private readonly userBaseUrl =
    process.env.USER_SERVICE_INTERNAL_URL ||
    `http://${process.env.USER_SERVICE_HOST || 'localhost'}:${
      process.env.USER_SERVICE_PORT || '3004'
    }/users`;

  private mapOrder(order: any): OrderType | null {
    if (!order) return null;
    return {
      id: order.id || order._id?.toString?.() || order._id,
      userId: order.userId || order.user?.id || order.user?._id?.toString?.(),
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            productId:
              item.productId || item.product?.id || item.product?._id?.toString?.(),
            quantity: item.quantity,
            price: item.price,
            productName: item.productName || item.product?.name,
            productImage: item.productImage || item.product?.image,
            lineTotal:
              item.lineTotal ?? (item.price ?? 0) * (item.quantity ?? 0),
          }))
        : [],
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus || order.paymentInfo?.status,
      paymentMethod: order.paymentMethod || order.paymentInfo?.method,
      customerName: order.customer?.name || order.customerSnapshot?.name,
      customerEmail: order.customer?.email || order.customerSnapshot?.email,
      customerPhone: order.customer?.phone || order.customerSnapshot?.phone,
      shippingAddress: this.stringifyAddress(
        order.shippingAddress,
        order.shippingAddressText,
      ),
      notes: order.notes,
      confirmedAt: order.confirmedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private ensureAdmin(context: any) {
    const isAdmin = context?.req?.user?.isAdmin;
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  private stringifyAddress(address: any, fallback?: string) {
    if (typeof fallback === 'string' && fallback.trim()) {
      return fallback.trim();
    }
    if (!address || typeof address !== 'object') {
      return undefined;
    }
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ]
      .filter((part) => typeof part === 'string' && part.trim())
      .map((part) => part.trim());
    return parts.length ? parts.join(', ') : undefined;
  }

  private async fetchProduct(productId: string): Promise<any | null> {
    try {
      const product = await firstValueFrom(
        this.productClient
          .send('get_product', { id: productId })
          .pipe(timeout(1_500)),
      );
      if (product) {
        return product;
      }
    } catch (error) {
      // fallback to REST below
    }

    try {
      const res = await fetch(`${this.productBaseUrl}/products/${productId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.warn('OrderResolver: unable to fetch product via REST', error);
    }
    return null;
  }

  private async fetchUserProfile(userId: string): Promise<any | null> {
    if (!userId) return null;
    try {
      const res = await fetch(`${this.userBaseUrl}/${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.warn('OrderResolver: unable to fetch user profile', error);
    }
    return null;
  }

  private async restFetchOrders(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/orders`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('OrderResolver: REST fetch orders failed', error);
      return [];
    }
  }

  private async restFetchOrder(id: string): Promise<any | null> {
    try {
      const res = await fetch(`${this.baseUrl}/orders/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('OrderResolver: REST fetch order failed', error);
      return null;
    }
  }

  private async restFetchOrdersByUser(userId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/orders/user/${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('OrderResolver: REST fetch orders by user failed', error);
      return [];
    }
  }

  @Query(() => [OrderType])
  async orders(@Context() context: any): Promise<OrderType[]> {
    this.ensureAdmin(context);
    try {
      const result = await firstValueFrom(
        this.orderClient.send('get_orders', {}).pipe(timeout(1_500)),
      );
      if (Array.isArray(result)) {
        return result.map((order) => this.mapOrder(order)).filter(Boolean);
      }
    } catch (error) {
      console.warn('OrderResolver: get_orders via microservice failed', error);
    }

    const fallback = await this.restFetchOrders();
    return fallback.map((order) => this.mapOrder(order)).filter(Boolean);
  }

  @Query(() => OrderType, { nullable: true })
  async order(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<OrderType | null> {
    const requester = context?.req?.user;
    try {
      const result = await firstValueFrom(
        this.orderClient.send('get_order', { id }).pipe(timeout(1_500)),
      );
      const mapped = this.mapOrder(result);
      if (mapped) {
        if (!requester?.isAdmin && mapped.userId !== requester?.id) {
          throw new ForbiddenException('Không có quyền xem đơn hàng này');
        }
        return mapped;
      }
    } catch (error) {
      console.warn('OrderResolver: get_order via microservice failed', error);
    }

    const fallback = this.mapOrder(await this.restFetchOrder(id));
    if (fallback && !requester?.isAdmin && fallback.userId !== requester?.id) {
      throw new ForbiddenException('Không có quyền xem đơn hàng này');
    }
    return fallback;
  }

  @Query(() => [OrderType])
  async myOrders(@Context() context: any): Promise<OrderType[]> {
    const requester = context?.req?.user;
    if (!requester?.id) {
      throw new UnauthorizedException('Bạn cần đăng nhập để xem đơn hàng');
    }

    try {
      const result = await firstValueFrom(
        this.orderClient
          .send('get_orders_by_user', { userId: requester.id })
          .pipe(timeout(1_500)),
      );
      if (Array.isArray(result)) {
        return result.map((order) => this.mapOrder(order)).filter(Boolean);
      }
    } catch (error) {
      // fall back to REST
    }

    const fallback = await this.restFetchOrdersByUser(requester.id);
    return fallback.map((order) => this.mapOrder(order)).filter(Boolean);
  }

  @Mutation(() => OrderType)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @Context() context: any,
  ): Promise<OrderType> {
    const requester = context?.req?.user;
    if (!requester?.id) {
      throw new UnauthorizedException('Bạn cần đăng nhập để đặt hàng');
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new ForbiddenException('Giỏ hàng trống, không thể tạo đơn hàng');
    }

    const detailedItems = [] as any[];
    let totalAmount = 0;

    for (const item of input.items) {
      const product = await this.fetchProduct(item.productId);
      if (!product) {
        throw new Error(`Không tìm thấy sản phẩm ${item.productId}`);
      }

      const quantity = Number(item.quantity || 0);
      if (quantity <= 0) {
        continue;
      }

      const price = Number(product.price || 0);
      const lineTotal = price * quantity;
      totalAmount += lineTotal;

      detailedItems.push({
        productId: product.id || product._id?.toString?.() || item.productId,
        productName: product.name,
        productImage: product.image,
        quantity,
        price,
        lineTotal,
      });
    }

    if (!detailedItems.length) {
      throw new Error('Không có sản phẩm hợp lệ để tạo đơn hàng');
    }

    const userProfile = await this.fetchUserProfile(requester.id);

    const paymentMethod = input.paymentMethod || 'paid_online';
    const paymentStatus =
      input.paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'paid');

    const payload = {
      userId: requester.id,
      items: detailedItems,
      totalAmount,
      status: 'pending_confirmation',
      paymentMethod,
      paymentStatus,
      paymentInfo: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId: input.transactionId,
      },
      shippingAddressText: input.shippingAddress,
      customerSnapshot: {
        name: userProfile?.name || requester.name,
        email: userProfile?.email || requester.email,
        phone: userProfile?.phone,
      },
      notes: input.note,
    };

    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(`Không thể tạo đơn hàng (${res.status}): ${message}`);
    }

    const created = await res.json();

    // cố gắng xóa giỏ hàng sau khi đặt thành công
    try {
      await firstValueFrom(
        this.cartClient
          .send({ cmd: 'clear_cart' }, { userId: requester.id })
          .pipe(timeout(1_500)),
      );
    } catch (error) {
      try {
        await fetch(`${this.cartBaseUrl}/cart?userId=${requester.id}`, {
          method: 'DELETE',
        });
      } catch (cleanupError) {
        console.warn('OrderResolver: unable to clear cart after checkout', cleanupError);
      }
    }

    return this.mapOrder(created);
  }

  @Mutation(() => OrderType, { nullable: true })
  async updateOrderStatus(
    @Args('id') id: string,
    @Args('status') status: string,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const res = await fetch(`${this.baseUrl}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Unable to update order status (${res.status})`);
    }

    return this.mapOrder(await res.json());
  }

  @Mutation(() => Boolean)
  async deleteOrder(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const res = await fetch(`${this.baseUrl}/orders/${id}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      return false;
    }

    if (!res.ok) {
      throw new Error(`Unable to delete order (${res.status})`);
    }

    return true;
  }
}
