import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Voucher, VoucherDocument } from './schemas/voucher.schema';

type CreateVoucherPayload = Partial<Voucher>;

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(
    @InjectModel(Voucher.name)
    private readonly voucherModel: Model<VoucherDocument>,
  ) {}

  async findAll(): Promise<Voucher[]> {
    const vouchers = await this.voucherModel.find().sort({ createdAt: -1 }).exec();
    return this.ensureVoucherStatuses(vouchers);
  }

  async findByUserId(userId: string): Promise<Voucher[]> {
    if (!userId) {
      return [];
    }
    const vouchers = await this.voucherModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return this.ensureVoucherStatuses(vouchers);
  }

  async create(payload: CreateVoucherPayload): Promise<Voucher> {
    const data: CreateVoucherPayload = {
      usageLimit: 1,
      usageCount: 0,
      status: 'active',
      validFrom: new Date(),
      ...payload,
    };

    if (!data.code) {
      data.code = this.generateCode(data.userId);
    }

    const voucher = new this.voucherModel(data);
    return voucher.save();
  }

  async markUsed(id: string): Promise<Voucher | null> {
    const voucher = await this.voucherModel.findById(id).exec();
    if (!voucher) {
      return null;
    }

    voucher.usageCount = Math.min(voucher.usageCount + 1, voucher.usageLimit);
    if (voucher.usageCount >= voucher.usageLimit) {
      voucher.status = 'used';
    }
    voucher.updatedAt = new Date();
    return voucher.save();
  }

  async issueRewardForOrder(order: {
    id?: string;
    _id?: any;
    userId: string;
    totalAmount: number;
    paymentStatus?: string;
    status?: string;
  }): Promise<Voucher | null> {
    if (!order?.userId) {
      return null;
    }

    const orderId =
      order.id ||
      (typeof order._id?.toString === 'function' ? order._id.toString() : order._id);

    if (!orderId) {
      return null;
    }

    const existing = await this.voucherModel
      .findOne({ userId: order.userId, sourceOrderId: orderId })
      .exec();
    if (existing) {
      return existing;
    }

    // Only issue voucher once payment is confirmed or the order is completed.
    if (order.paymentStatus && !['paid', 'refunded'].includes(order.paymentStatus)) {
      if (order.status && !['completed', 'delivered'].includes(order.status)) {
        return null;
      }
    }

    const baseTotal = Number(order.totalAmount) || 0;
    const discountValue = this.calculateDiscountValue(baseTotal);

    if (discountValue <= 0) {
      return null;
    }

    const now = new Date();
    const voucher = new this.voucherModel({
      code: this.generateCode(order.userId),
      userId: order.userId,
      discountType: 'fixed',
      discountValue,
      minOrderValue: Math.max(Math.round(baseTotal * 0.4), 100000),
      maxDiscountValue: discountValue,
      description:
        'Voucher cảm ơn đã mua hàng. Áp dụng cho đơn tiếp theo trong 30 ngày.',
      validFrom: now,
      validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 1,
      usageCount: 0,
      status: 'active',
      sourceOrderId: orderId,
      metadata: {
        rewardType: 'order_reward',
      },
    });

    try {
      return await voucher.save();
    } catch (error) {
      this.logger.warn(
        `Could not create voucher for order ${orderId}: ${error}`,
      );
      return null;
    }
  }

  private ensureVoucherStatuses(vouchers: Voucher[]): Voucher[] {
    const now = new Date();
    vouchers.forEach((voucher) => {
      if (
        voucher.status === 'active' &&
        voucher.validUntil &&
        voucher.validUntil < now
      ) {
        voucher.status = 'expired';
        voucher.save().catch((error) =>
          this.logger.warn(`Failed to set voucher ${voucher.id} as expired: ${error}`),
        );
      }
    });
    return vouchers;
  }

  private generateCode(userId?: string) {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const userFragment = userId
      ? userId.toString().slice(-4).toUpperCase()
      : 'USR';
    return `THNX-${userFragment}-${random}`;
  }

  private calculateDiscountValue(totalAmount: number): number {
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return 0;
    }
    const fivePercent = Math.round(totalAmount * 0.05);
    return Math.min(Math.max(fivePercent, 20000), 200000);
  }
}
