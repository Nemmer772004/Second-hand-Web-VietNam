import mongoose from 'mongoose';

const ORDER_STATUSES = [
  'pending_confirmation',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
] as const;

const PAYMENT_STATUSES = ['paid', 'pending', 'failed', 'refunded'] as const;

const PAYMENT_METHODS = ['paid_online', 'cod', 'bank_transfer', 'card'] as const;

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String },
    productImage: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const customerSnapshotSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
  },
  { _id: false },
);

const paymentInfoSchema = new mongoose.Schema(
  {
    method: { type: String, enum: PAYMENT_METHODS },
    status: { type: String, enum: PAYMENT_STATUSES },
    transactionId: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], required: true, default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending_confirmation',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'paid_online',
    },
    paymentInfo: {
      type: paymentInfoSchema,
      default: () => ({})
    },
    customerSnapshot: customerSnapshotSchema,
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
    },
    shippingAddressText: String,
    notes: String,
    confirmedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
