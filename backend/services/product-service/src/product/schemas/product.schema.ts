import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ alias: 'product_id', index: true })
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

  @Prop()
  brand?: string;

  @Prop({ default: 0, alias: 'sold_count' })
  soldCount?: number;

  @Prop({ default: 0, alias: 'average_rating' })
  averageRating?: number;

  @Prop({ default: 0, alias: 'num_reviews' })
  numReviews?: number;

  @Prop()
  legacyId?: number;

  @Prop()
  category?: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  displayCategory?: string;

  @Prop()
  slug?: string;

  @Prop({ type: Object, default: null })
  dimensions?: Record<string, any> | null;

  @Prop({ type: [String], default: [] })
  features?: string[];

  @Prop()
  weight?: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
