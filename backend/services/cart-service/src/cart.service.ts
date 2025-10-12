import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Cart } from './entities/cart.entity';

type CartPayload = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
};

@Injectable()
export class CartService implements OnModuleInit {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  private get productServiceUrl(): string {
    const host =
      process.env.PRODUCT_SERVICE_HTTP_HOST ||
      process.env.PRODUCT_SERVICE_HOST ||
      'localhost';
    const port =
      process.env.PRODUCT_SERVICE_HTTP_PORT ||
      process.env.PRODUCT_SERVICE_PORT ||
      '3001';
    return process.env.PRODUCT_SERVICE_URL || `http://${host}:${port}`;
  }

  private normalizeQuantity(quantity: number): number {
    const value = Math.floor(Number(quantity));
    if (Number.isNaN(value) || value <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
    return value;
  }

  private normalizePrice(price: unknown): number {
    const value = Number(price);
    if (Number.isNaN(value) || value < 0) {
      throw new BadRequestException('Received invalid product price');
    }
    return value;
  }

  async onModuleInit() {
    await this.ensureColumnTypes();
  }

  private async ensureColumnTypes() {
    const queries = [
      `ALTER TABLE "cart_items" ALTER COLUMN "userId" TYPE character varying(128) USING "userId"::text`,
      `ALTER TABLE "cart_items" ALTER COLUMN "productId" TYPE character varying(128) USING "productId"::text`,
    ];

    for (const query of queries) {
      try {
        await this.cartRepository.query(query);
      } catch (error) {
        // Ignore errors (column already in desired state)
      }
    }
  }

  private mapCart(cart: Cart): CartPayload {
    return {
      id: cart.id,
      userId: cart.userId,
      productId: cart.productId,
      quantity: cart.quantity,
      unitPrice: Number(cart.unitPrice),
      totalPrice: Number(cart.totalPrice),
      createdAt: cart.createdAt?.toISOString?.(),
      updatedAt: cart.updatedAt?.toISOString?.(),
    };
  }

  private async fetchProduct(productId: string): Promise<any> {
    try {
      const product = await firstValueFrom(
        this.productClient.send('get_product', { id: productId }),
      );
      if (product) {
        return product;
      }
    } catch (error) {
      // fall back to REST
    }

    try {
      const response = await fetch(`${this.productServiceUrl}/products/${productId}`);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      // ignore, will fall through
    }

    throw new NotFoundException(`Product ${productId} not found`);
  }

  private computeTotals(unitPrice: number, quantity: number) {
    const normalizedQuantity = this.normalizeQuantity(quantity);
    const normalizedUnitPrice = this.normalizePrice(unitPrice);
    const total = Number((normalizedUnitPrice * normalizedQuantity).toFixed(2));
    return {
      quantity: normalizedQuantity,
      unitPrice: normalizedUnitPrice,
      totalPrice: total,
    };
  }

  async findAll(userId: string): Promise<CartPayload[]> {
    const carts = await this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    return carts.map((item) => this.mapCart(item));
  }

  async findOne(id: string, userId: string): Promise<CartPayload> {
    const cart = await this.cartRepository.findOne({
      where: { id, userId },
    });
    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }
    return this.mapCart(cart);
  }

  async create(userId: string, productId: string, quantity: number): Promise<CartPayload> {
    if (!userId || !productId) {
      throw new BadRequestException('userId and productId are required');
    }

    const product = await this.fetchProduct(productId);
    const totals = this.computeTotals(product?.price ?? product?.unitPrice ?? 0, quantity);

    let cart = await this.cartRepository.findOne({ where: { userId, productId } });
    if (cart) {
      cart.quantity = this.normalizeQuantity(cart.quantity + totals.quantity);
    } else {
      cart = this.cartRepository.create({
        userId,
        productId,
        quantity: totals.quantity,
      });
    }

    cart.unitPrice = totals.unitPrice;
    cart.totalPrice = Number((cart.unitPrice * cart.quantity).toFixed(2));

    const saved = await this.cartRepository.save(cart);
    return this.mapCart(saved);
  }

  async update(id: string, userId: string, payload: { quantity?: number }): Promise<CartPayload> {
    const cart = await this.cartRepository.findOne({ where: { id, userId } });
    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    const nextQuantity =
      payload.quantity != null ? this.normalizeQuantity(payload.quantity) : cart.quantity;

    const product = await this.fetchProduct(cart.productId);
    const totals = this.computeTotals(product?.price ?? product?.unitPrice ?? cart.unitPrice, nextQuantity);

    cart.quantity = totals.quantity;
    cart.unitPrice = totals.unitPrice;
    cart.totalPrice = totals.totalPrice;

    const saved = await this.cartRepository.save(cart);
    return this.mapCart(saved);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const result = await this.cartRepository.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    await this.cartRepository.delete({ userId });
    return true;
  }
}
