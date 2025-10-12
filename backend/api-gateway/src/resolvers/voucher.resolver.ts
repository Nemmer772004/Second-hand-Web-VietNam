import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ObjectType,
  Field,
  InputType,
} from '@nestjs/graphql';
import { Inject, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { fetchWithRetry } from '../utils/http';

@ObjectType()
class VoucherType {
  @Field()
  id: string;

  @Field()
  code: string;

  @Field()
  status: string;

  @Field()
  discountType: string;

  @Field()
  discountValue: number;

  @Field({ nullable: true })
  minOrderValue?: number;

  @Field({ nullable: true })
  maxDiscountValue?: number;

  @Field()
  userId: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  validFrom?: string;

  @Field({ nullable: true })
  validUntil?: string;

  @Field({ nullable: true })
  usageLimit?: number;

  @Field({ nullable: true })
  usageCount?: number;

  @Field({ nullable: true })
  sourceOrderId?: string;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@InputType()
class CreateVoucherInput {
  @Field()
  userId: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  discountType?: string;

  @Field()
  discountValue: number;

  @Field({ nullable: true })
  minOrderValue?: number;

  @Field({ nullable: true })
  maxDiscountValue?: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  validFrom?: string;

  @Field({ nullable: true })
  validUntil?: string;
}

@Resolver(() => VoucherType)
export class VoucherResolver {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  private readonly baseUrl =
    process.env.ORDER_SERVICE_URL ||
    `http://${process.env.ORDER_SERVICE_HOST || 'localhost'}:${
      process.env.ORDER_SERVICE_PORT || '3003'
    }`;

  private mapVoucher(raw: any): VoucherType | null {
    if (!raw) {
      return null;
    }

    return {
      id: raw.id || raw._id?.toString?.() || raw._id,
      code: raw.code,
      status: raw.status,
      discountType: raw.discountType,
      discountValue: raw.discountValue,
      minOrderValue: raw.minOrderValue,
      maxDiscountValue: raw.maxDiscountValue,
      userId: raw.userId,
      description: raw.description,
      validFrom: raw.validFrom,
      validUntil: raw.validUntil,
      usageLimit: raw.usageLimit,
      usageCount: raw.usageCount,
      sourceOrderId: raw.sourceOrderId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private ensureAdmin(context: any) {
    const isAdmin = context?.req?.user?.isAdmin;
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
  }

  @Query(() => [VoucherType])
  async myVouchers(@Context() context: any): Promise<VoucherType[]> {
    const requester = context?.req?.user;
    if (!requester?.id) {
      throw new UnauthorizedException('Bạn cần đăng nhập để xem voucher');
    }

    try {
      const result = await firstValueFrom(
        this.orderClient
          .send('get_vouchers_by_user', { userId: requester.id })
          .pipe(timeout(1_500)),
      );
      if (Array.isArray(result)) {
        return result.map((voucher) => this.mapVoucher(voucher)).filter(Boolean) as VoucherType[];
      }
    } catch (error) {
      // fall back to REST request
    }

    const response = await fetchWithRetry(`${this.baseUrl}/vouchers/user/${requester.id}`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((voucher) => this.mapVoucher(voucher)).filter(Boolean) as VoucherType[];
  }

  @Query(() => [VoucherType])
  async vouchers(@Context() context: any): Promise<VoucherType[]> {
    this.ensureAdmin(context);

    try {
      const result = await firstValueFrom(
        this.orderClient.send('get_vouchers', {}).pipe(timeout(1_500)),
      );
      if (Array.isArray(result)) {
        return result.map((voucher) => this.mapVoucher(voucher)).filter(Boolean) as VoucherType[];
      }
    } catch (error) {
      // fallback below
    }

    const response = await fetchWithRetry(`${this.baseUrl}/vouchers`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((voucher) => this.mapVoucher(voucher)).filter(Boolean) as VoucherType[];
  }

  @Mutation(() => VoucherType)
  async createVoucher(
    @Args('input') input: CreateVoucherInput,
    @Context() context: any,
  ): Promise<VoucherType> {
    this.ensureAdmin(context);

    try {
      const result = await firstValueFrom(
        this.orderClient
          .send('create_voucher', { input })
          .pipe(timeout(1_500)),
      );
      const mapped = this.mapVoucher(result);
      if (mapped) {
        return mapped;
      }
    } catch (error) {
      // fallback to REST
    }

    const response = await fetchWithRetry(`${this.baseUrl}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Không thể tạo voucher');
    }

    const data = await response.json();
    const mapped = this.mapVoucher(data);
    if (!mapped) {
      throw new Error('Không thể tạo voucher');
    }

    return mapped;
  }
}
