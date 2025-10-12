import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartMessageController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'get_cart' })
  getCart(@Payload() data: { userId: string }) {
    if (!data?.userId) {
      return [];
    }
    return this.cartService.findAll(String(data.userId));
  }

  @MessagePattern({ cmd: 'get_cart_item' })
  getCartItem(@Payload() data: { id: string; userId: string }) {
    if (!data?.id || !data?.userId) {
      return null;
    }
    return this.cartService.findOne(String(data.id), String(data.userId));
  }

  @MessagePattern({ cmd: 'add_to_cart' })
  addToCart(@Payload() data: { userId: string; productId: string; quantity?: number }) {
    return this.cartService.create(
      String(data.userId),
      String(data.productId),
      data.quantity ?? 1,
    );
  }

  @MessagePattern({ cmd: 'update_cart_item' })
  updateCartItem(@Payload() data: { id: string; userId: string; quantity?: number }) {
    return this.cartService.update(
      String(data.id),
      String(data.userId),
      { quantity: data.quantity },
    );
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  async removeFromCart(@Payload() data: { id: string; userId: string }) {
    if (!data?.id || !data?.userId) {
      return false;
    }
    return this.cartService.remove(String(data.id), String(data.userId));
  }

  @MessagePattern({ cmd: 'clear_cart' })
  async clearCart(@Payload() data: { userId: string }) {
    if (!data?.userId) {
      return false;
    }
    return this.cartService.clearCart(String(data.userId));
  }
}
