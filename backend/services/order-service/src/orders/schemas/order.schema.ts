import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [{
      productId: String,
      quantity: Number,
      price: Number
    }],
    required: true
  })
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] })
  status: string;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  @Prop({
    type: {
      method: String,
      status: String,
      transactionId: String
    }
  })
  paymentInfo: {
    method: string;
    status: string;
    transactionId?: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
