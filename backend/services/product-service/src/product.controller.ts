import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('products')
  async findAll() {
    try {
      console.log('Fetching all products');
      const products = await this.productService.findAll();
      console.log(`Found ${products.length} products`);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.productService.searchProducts(query);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    try {
      console.log('Fetching products by category:', categoryId);
      const products = await this.productService.findByCategory(categoryId);
      console.log(`Found ${products.length} products in category ${categoryId}`);
      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      console.log('Fetching product by id:', id);
      const product = await this.productService.findOne(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  @Post()
  async create(@Body() productData: Partial<Product>) {
    try {
      console.log('Creating new product:', productData);
      const product = await this.productService.create(productData);
      console.log('Product created successfully:', product);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() productData: Partial<Product>) {
    try {
      console.log('Updating product:', id, productData);
      const product = await this.productService.update(id, productData);
      if (!product) {
        throw new Error('Product not found');
      }
      console.log('Product updated successfully:', product);
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      console.log('Removing product:', id);
      const result = await this.productService.remove(id);
      if (!result) {
        throw new Error('Product not found');
      }
      console.log('Product removed successfully');
      return { message: 'Product removed successfully' };
    } catch (error) {
      console.error('Error removing product:', error);
      throw new Error(`Failed to remove product: ${error.message}`);
    }
  }
}
