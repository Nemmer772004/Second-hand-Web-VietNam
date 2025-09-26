import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const ORDER_STATUSES = [
  'pending_confirmation',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
] as const;

export const PAYMENT_STATUSES = ['paid', 'pending', 'failed', 'refunded'] as const;

export const PAYMENT_METHODS = ['paid_online', 'cod', 'bank_transfer', 'card'] as const;

@Schema({ _id: false })
export class OrderItemSchemaClass {
  @Prop({ required: true })
  productId: string;

  @Prop()
  productName?: string;

  @Prop()
  productImage?: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  lineTotal: number;
}

@Schema({ _id: false })
export class CustomerSnapshotSchemaClass {
  @Prop()
  name?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;
}

@Schema({ _id: false })
export class PaymentInfoSchemaClass {
  @Prop({ enum: PAYMENT_METHODS })
  method?: string;

  @Prop({ enum: PAYMENT_STATUSES })
  status?: string;

  @Prop()
  transactionId?: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItemSchemaClass);
const CustomerSnapshotSchema = SchemaFactory.createForClass(CustomerSnapshotSchemaClass);
const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfoSchemaClass);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: Array<{
    productId: string;
    productName?: string;
    productImage?: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({
    type: String,
    required: true,
    enum: ORDER_STATUSES,
    default: 'pending_confirmation',
  })
  status: string;

  @Prop({ type: String, enum: PAYMENT_STATUSES, default: 'pending' })
  paymentStatus: string;

  @Prop({ type: String, enum: PAYMENT_METHODS, default: 'paid_online' })
  paymentMethod: string;

  @Prop({ type: PaymentInfoSchema, default: () => ({}) })
  paymentInfo?: {
    method?: string;
    status?: string;
    transactionId?: string;
  };

  @Prop({ type: CustomerSnapshotSchema })
  customerSnapshot?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  @Prop()
  shippingAddressText?: string;

  @Prop({ type: Object })
  shippingAddress?: Record<string, any>;

  @Prop()
  notes?: string;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
