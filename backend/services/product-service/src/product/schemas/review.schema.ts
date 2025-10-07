import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: false })
export class Review {
  @Prop({ required: true, index: true, alias: 'product_id' })
  productId: number;

  @Prop({ required: true, alias: 'review_id' })
  reviewId: number;

  @Prop({ type: Number, required: true })
  star: number;

  @Prop({ required: true, alias: 'reviewer_name' })
  reviewerName: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  time?: string;

  @Prop()
  variation?: string;

  @Prop({ type: Number, default: 0, alias: 'liked_count' })
  likedCount?: number;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ default: null, alias: 'shop_reply' })
  shopReply?: string | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
