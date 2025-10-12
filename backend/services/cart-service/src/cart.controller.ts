import { BadRequestException, Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'cart-service',
      timestamp: new Date().toISOString(),
    };
  }

  private resolveUserId(bodyUserId?: string, headerUserId?: string, queryUserId?: string): string {
    const resolved = bodyUserId || queryUserId || headerUserId;
    if (!resolved) {
      throw new BadRequestException('userId is required');
    }
    return String(resolved);
  }

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(undefined, headerUserId, userId);
    return this.cartService.findAll(resolvedUserId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(undefined, headerUserId, userId);
    return this.cartService.findOne(id, resolvedUserId);
  }

  @Post()
  create(
    @Body() body: Record<string, any>,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = this.resolveUserId(body?.userId, headerUserId);
    if (!body?.productId) {
      throw new BadRequestException('productId is required');
    }
    return this.cartService.create(userId, body.productId, body.quantity ?? 1);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() body: Record<string, any>,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(body?.userId, headerUserId, userId);
    return this.cartService.update(id, resolvedUserId, { quantity: body?.quantity });
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(undefined, headerUserId, userId);
    await this.cartService.remove(id, resolvedUserId);
    return { success: true };
  }

  @Put(':id/quantity')
  updateQuantity(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body('quantity') quantity: number,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(undefined, headerUserId, userId);
    return this.cartService.update(id, resolvedUserId, { quantity });
  }

  @Delete()
  async clearCart(
    @Query('userId') userId: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const resolvedUserId = this.resolveUserId(undefined, headerUserId, userId);
    await this.cartService.clearCart(resolvedUserId);
    return { success: true };
  }
}
