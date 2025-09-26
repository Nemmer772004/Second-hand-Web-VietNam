import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.cartService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId: string) {
    return this.cartService.findOne(id, userId);
  }

  @Post()
  create(@Body() cartItem: Partial<CartItem>) {
    return this.cartService.create(cartItem);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() cartItem: Partial<CartItem>,
  ) {
    return this.cartService.update(id, userId, cartItem);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.cartService.remove(id, userId);
  }

  @Put(':id/quantity')
  updateQuantity(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(id, userId, quantity);
  }

  @Delete()
  clearCart(@Query('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
