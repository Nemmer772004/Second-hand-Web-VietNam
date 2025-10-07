import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller()
export class ProductController {
  private readonly objectIdRegex = /^[0-9a-fA-F]{24}$/;

  constructor(private readonly productService: ProductService) {}

  @Get('health')
  async healthCheck() {
    try {
      // Try to connect to database
      await this.productService.findAll();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'product-service',
      };
    } catch (error) {
      throw new HttpException({
        status: 'error',
        error: error.message,
      }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Get('products')
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get('products/:id')
  async findOne(@Param('id') id: string): Promise<Product> {
    let product: Product | null = null;

    if (this.objectIdRegex.test(id)) {
      product = await this.productService.findOne(id);
    } else if (!Number.isNaN(Number(id))) {
      product = await this.productService.findByProductId(Number(id));
    } else {
      product = await this.productService.findOne(id);
    }

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  @Post('products')
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    try {
      console.log('Creating product:', createProductDto);
      const product = await this.productService.create(createProductDto);
      console.log('Product created successfully:', product);
      return product;
    } catch (error) {
      console.error('Error creating product:', {
        dto: createProductDto,
        error: error.message,
        stack: error.stack
      });
      throw new HttpException(
        error.message || 'Error creating product',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('products/:id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productService.update(id, updateProductDto);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  @Delete('products/:id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.productService.delete(id);
    if (!result) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
  }
}
