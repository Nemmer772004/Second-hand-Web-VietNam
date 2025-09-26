import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryModel.findById(id).exec();
  }

  async create(createCategoryDto: any): Promise<Category> {
    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return createdCategory.save();
  }

  async update(id: string, updateCategoryDto: any): Promise<Category> {
    const updatedCategory = {
      ...updateCategoryDto,
      updatedAt: new Date()
    };
    return this.categoryModel
      .findByIdAndUpdate(id, updatedCategory, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
