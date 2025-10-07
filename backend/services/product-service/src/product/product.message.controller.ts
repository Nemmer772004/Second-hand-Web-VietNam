import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller()
export class ProductMessageController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('get_products')
  async getProducts() {
    return this.productService.findAll();
  }

  @MessagePattern('get_product')
  async getProduct(@Payload() data: { id: string }) {
    return this.productService.findOne(data.id);
  }

  @MessagePattern('get_product_by_product_id')
  async getProductByProductId(@Payload() data: { productId: number }) {
    return this.productService.findByProductId(Number(data.productId));
  }

  @MessagePattern('get_products_by_category')
  async getProductsByCategory(@Payload() data: { category: string }) {
    const all = await this.productService.findAll();
    return all.filter((p: any) => p.category === data.category);
  }
}

