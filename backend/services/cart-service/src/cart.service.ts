import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findAll(userId: string): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { userId }
    });
  }

  async findOne(id: string, userId: string): Promise<CartItem> {
    return this.cartItemRepository.findOne({
      where: { id, userId }
    });
  }

  async create(cartItem: Partial<CartItem>): Promise<CartItem> {
    const newItem = this.cartItemRepository.create(cartItem);
    return this.cartItemRepository.save(newItem);
  }

  async update(id: string, userId: string, cartItem: Partial<CartItem>): Promise<CartItem> {
    await this.cartItemRepository.update({ id, userId }, cartItem);
    return this.cartItemRepository.findOne({ where: { id, userId } });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.cartItemRepository.delete({ id, userId });
  }

  async updateQuantity(id: string, userId: string, quantity: number): Promise<CartItem> {
    await this.cartItemRepository.update({ id, userId }, { quantity });
    return this.cartItemRepository.findOne({ where: { id, userId } });
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }
}
