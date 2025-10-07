import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop({ alias: 'product_id' })
  productId?: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  category?: string;

  @Prop()
  displayCategory?: string;

  @Prop()
  brand?: string;

  @Prop({ default: 0 })
  soldCount?: number;

  @Prop({ default: 0 })
  averageRating?: number;

  @Prop({ default: 0 })
  numReviews?: number;

  @Prop()
  slug?: string;

  @Prop()
  legacyId?: number;

  @Prop({ type: Object, default: null })
  dimensions?: Record<string, any> | null;

  @Prop({ type: [String], default: [] })
  features?: string[];

  @Prop()
  weight?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
