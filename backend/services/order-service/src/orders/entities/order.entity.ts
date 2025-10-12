import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

export type OrderItem = {
  productId: string;
  productName?: string;
  productImage?: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type PaymentInfo = {
  method?: PaymentMethodValue;
  status?: PaymentStatusValue;
  transactionId?: string;
};

export type CustomerSnapshot = {
  name?: string;
  email?: string;
  phone?: string;
};

@Entity({ name: 'orders' })
@Index(['userId'])
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  userId!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  items!: OrderItem[];

  @Column({ type: 'double precision', default: 0 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 64, default: 'pending_confirmation' })
  status!: OrderStatusValue;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  paymentStatus!: PaymentStatusValue;

  @Column({ type: 'varchar', length: 32, default: 'paid_online' })
  paymentMethod!: PaymentMethodValue;

  @Column({ type: 'jsonb', nullable: true })
  paymentInfo?: PaymentInfo | null;

  @Column({ type: 'jsonb', nullable: true })
  customerSnapshot?: CustomerSnapshot | null;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: Record<string, any> | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  shippingAddressText?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
