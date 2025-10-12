import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const VOUCHER_STATUSES = ['active', 'used', 'expired'] as const;
export const VOUCHER_DISCOUNT_TYPES = ['fixed', 'percentage'] as const;

@Schema({ timestamps: true })
export class Voucher extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: VOUCHER_DISCOUNT_TYPES })
  discountType: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ min: 0 })
  minOrderValue?: number;

  @Prop({ min: 0 })
  maxDiscountValue?: number;

  @Prop({ default: 'active', enum: VOUCHER_STATUSES })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  validFrom?: Date;

  @Prop()
  validUntil?: Date;

  @Prop({ default: 1, min: 1 })
  usageLimit: number;

  @Prop({ default: 0, min: 0 })
  usageCount: number;

  @Prop()
  sourceOrderId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export type VoucherDocument = Voucher & Document;
export const VoucherSchema = SchemaFactory.createForClass(Voucher);
