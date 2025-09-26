import { Resolver, Query, Args, ObjectType, Field, Mutation, Context } from '@nestjs/graphql';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@ObjectType()
class OrderItemType {
  @Field()
  productId: string;

  @Field()
  quantity: number;

  @Field()
  price: number;
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
  shippingAddress?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@Resolver()
export class OrderResolver {
  constructor(
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  private readonly baseUrl =
    process.env.ORDER_SERVICE_URL ||
    `http://${process.env.ORDER_SERVICE_HOST || 'localhost'}:${
      process.env.ORDER_SERVICE_PORT || '3003'
    }`;

  private mapOrder(order: any) {
    if (!order) return null;
    return {
      id: order.id || order._id?.toString?.() || order._id,
      userId: order.userId || order.user?.id || order.user?._id?.toString?.(),
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            productId: item.productId || item.product?.id || item.product?._id?.toString?.(),
            quantity: item.quantity,
            price: item.price,
          }))
        : [],
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    } as OrderType;
  }

  private ensureAdmin(context: any) {
    const isAdmin = context?.req?.user?.isAdmin;
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  @Query(() => [OrderType])
  async orders(): Promise<any[]> {
    try {
      const result = await firstValueFrom(
        this.orderClient.send('get_orders', {})
      );
      return Array.isArray(result) ? result.map((order) => this.mapOrder(order)) : [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  @Query(() => OrderType, { nullable: true })
  async order(@Args('id') id: string): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.orderClient.send('get_order', { id })
      );
      return this.mapOrder(result);
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
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
