import { Resolver, Query, Mutation, Args, Context, InputType, Field, ObjectType } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  userId: string;
}

@ObjectType()
class ProductMiniType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  stock?: number;
}

@ObjectType()
class CartItemType {
  @Field()
  id: string;

  @Field()
  quantity: number;

  @Field()
  productId: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  price?: number;

  @Field(() => ProductMiniType, { nullable: true })
  product?: ProductMiniType;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;
}

@InputType()
class CartItemInput {
  @Field()
  productId: string;

  @Field()
  quantity: number;
}

@InputType()
class UpdateCartItemInput {
  @Field()
  quantity: number;
}

@Resolver()
export class CartResolver {
  constructor(
    @Inject('CART_SERVICE') private readonly cartService: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @Query(() => [CartItemType])
  async cart(@Context() context: any): Promise<CartItem[]> {
    const { req } = context;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';
    let items: any[] | null = null;
    // Try microservice first
    try {
      items = await firstValueFrom(
        this.cartService.send({ cmd: 'get_cart' }, { userId })
      );
    } catch {}
    // REST fallback
    if (!items) {
      try {
        const res = await fetch(`http://localhost:3007/cart?userId=${userId}`, {
          headers: { 'x-user-id': String(userId) }
        });
        const data = await res.json();
        if (Array.isArray(data)) items = data;
      } catch {}
    }
    items = items || [];

    // Enrich with product and price
    const enriched = await Promise.all((items || []).map(async (item: any) => {
      try {
        const product = await firstValueFrom(
          this.productClient.send('get_product', { id: item.productId })
        );
        return {
          ...item,
          product: product ? {
            id: product.id || product._id?.toString?.() || product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
          } : undefined,
          price: product ? Number(product.price) * Number(item.quantity) : undefined,
        };
      } catch {
        return item;
      }
    }));

    return enriched as any;
  }

  @Query(() => CartItemType, { nullable: true })
  async cartItem(
    @Args('id') id: string,
    @Context() context: any
  ): Promise<CartItem | null> {
    const { req } = context;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';

    let item: any = null;
    try {
        item = await firstValueFrom(
        this.cartService.send({ cmd: 'get_cart_item' }, { id, userId })
      );
    } catch (error) {
      console.warn('CartResolver: TCP get_cart_item failed, fallback to REST', error?.message || error);
    }

    if (!item) {
      try {
        const res = await fetch(`http://localhost:3007/cart/${id}?userId=${userId}`);
        if (res.ok) {
          item = await res.json();
        }
      } catch (error) {
        console.error('CartResolver: REST get_cart_item failed', error);
      }
    }

    if (!item) return null;
    try {
      const product = await firstValueFrom(
        this.productClient.send('get_product', { id: item.productId })
      );
      return {
        ...item,
        product: product ? {
          id: product.id || product._id?.toString?.() || product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        } : undefined,
        price: product ? Number(product.price) * Number(item.quantity) : undefined,
      } as any;
    } catch {
      return item as any;
    }
  }

  @Mutation(() => CartItemType)
  async addToCart(
    @Args('input') input: CartItemInput,
    @Context() context: any
  ): Promise<CartItem> {
    const { req } = context;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';

    let item: any = null;
    try {
      item = await firstValueFrom(
        this.cartService.send({ cmd: 'add_to_cart' }, { userId, ...input })
      );
    } catch (error) {
      console.warn('CartResolver: TCP add_to_cart failed, fallback to REST', error?.message || error);
    }

    if (!item) {
      try {
        const res = await fetch('http://localhost:3007/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(userId),
          },
          body: JSON.stringify({ userId, ...input }),
        });
        if (!res.ok) {
          throw new Error(`REST POST /cart returned ${res.status}`);
        }
        item = await res.json();
      } catch (error) {
        console.error('CartResolver: REST add_to_cart failed', error);
        throw error;
      }
    }
    try {
      const product = await firstValueFrom(
        this.productClient.send('get_product', { id: item.productId })
      );
      return {
        ...item,
        product: product ? {
          id: product.id || product._id?.toString?.() || product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        } : undefined,
        price: product ? Number(product.price) * Number(item.quantity) : undefined,
      } as any;
    } catch {
      return item as any;
    }
  }

  @Mutation(() => CartItemType)
  async updateCartItem(
    @Args('id') id: string,
    @Args('input') input: UpdateCartItemInput,
    @Context() context: any
  ): Promise<CartItem> {
    const { req } = context;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';

    let item: any = null;
    try {
      item = await firstValueFrom(
        this.cartService.send({ cmd: 'update_cart_item' }, { id, userId, ...input })
      );
    } catch (error) {
      console.warn('CartResolver: TCP update_cart_item failed, fallback to REST', error?.message || error);
    }

    if (!item) {
      try {
        const res = await fetch(`http://localhost:3007/cart/${id}?userId=${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(userId),
          },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          throw new Error(`REST PUT /cart/${id} returned ${res.status}`);
        }
        item = await res.json();
      } catch (error) {
        console.error('CartResolver: REST update_cart_item failed', error);
        throw error;
      }
    }

    try {
      const product = await firstValueFrom(
        this.productClient.send('get_product', { id: item.productId })
      );
      return {
        ...item,
        product: product ? {
          id: product.id || product._id?.toString?.() || product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
        } : undefined,
        price: product ? Number(product.price) * Number(item.quantity) : undefined,
      } as any;
    } catch {
      return item as any;
    }
  }

  @Mutation(() => Boolean)
  async removeFromCart(
    @Args('id') id: string,
    @Context() context: any
  ): Promise<boolean> {
    const { req } = context;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';

    try {
      return await firstValueFrom(
        this.cartService.send({ cmd: 'remove_from_cart' }, { id, userId })
      );
    } catch (error) {
      console.warn('CartResolver: TCP remove_from_cart failed, fallback to REST', error?.message || error);
    }

    try {
      const res = await fetch(`http://localhost:3007/cart/${id}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': String(userId),
        },
      });
      if (!res.ok) {
        throw new Error(`REST DELETE /cart/${id} returned ${res.status}`);
      }
      return true;
    } catch (error) {
      console.error('CartResolver: REST remove_from_cart failed', error);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  async clearCart(@Context() context: any): Promise<boolean> {
    const { req } = context;
    const userId = req.user?.id || req.headers['x-user-id'] || 'guest';

    try {
      return await firstValueFrom(
        this.cartService.send({ cmd: 'clear_cart' }, { userId })
      );
    } catch (error) {
      console.warn('CartResolver: TCP clear_cart failed, fallback to REST', error?.message || error);
    }

    try {
      const res = await fetch(`http://localhost:3007/cart?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': String(userId),
        },
      });
      if (!res.ok) {
        throw new Error(`REST DELETE /cart returned ${res.status}`);
      }
      return true;
    } catch (error) {
      console.error('CartResolver: REST clear_cart failed', error);
      throw error;
    }
  }
}
