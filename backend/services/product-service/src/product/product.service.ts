import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  async findAll(): Promise<any[]> {
    const docs = await this.productModel.find().lean().exec();
    return docs;
  }

  async findOne(id: string): Promise<any> {
    return this.productModel.findById(id).lean().exec();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Validate required fields
      if (!createProductDto.name || !createProductDto.price || !createProductDto.category) {
        throw new Error('Name, price, and category are required fields');
      }

      // Validate price
      if (createProductDto.price < 0) {
        throw new Error('Price must be a positive number');
      }

      const createdProduct = new this.productModel({
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Save and handle potential MongoDB errors
      const savedProduct = await createdProduct.save();
      console.log('Product saved successfully:', savedProduct);
      return savedProduct;
    } catch (error) {
      console.error('Error in create product service:', {
        dto: createProductDto,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(
        id,
        { ...updateProductDto, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
