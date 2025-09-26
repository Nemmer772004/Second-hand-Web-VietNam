import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ 
      where: { id, isActive: true } 
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, productData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.productRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return true;
    } catch (error) {
      console.error('Error removing product:', error);
      return false;
    }
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { categoryId, isActive: true }
    });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('(product.name ILIKE :query OR product.description ILIKE :query) AND product.isActive = :isActive', {
        query: `%${query}%`,
        isActive: true
      })
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }
}
