import { Resolver, Query, Args, ObjectType, Field, InputType, Mutation, Context } from '@nestjs/graphql';
import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@ObjectType()
class DimensionsType {
  @Field()
  width: number;

  @Field()
  height: number;

  @Field()
  depth: number;
}

@ObjectType()
class ProductType {
  @Field()
  id: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  categoryName?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  stock?: number;

  @Field({ nullable: true })
  rating?: number;

  @Field({ nullable: true })
  reviews?: number;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => DimensionsType, { nullable: true })
  dimensions?: DimensionsType;

  @Field({ nullable: true })
  weight?: number;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;

  @Field({ nullable: true })
  displayCategory?: string;
}

@InputType()
class ProductInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  category: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  stock?: number;
}

@Resolver()
@Injectable()
export class ProductResolver {
  private readonly baseUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

  private readonly objectIdRegex = /^[0-9a-fA-F]{24}$/;

  constructor(
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
  ) {}

  @Query(() => [ProductType])
  async products(): Promise<any[]> {
    const raw = await this.fetchProductsFromSources();
    return raw.map(this.mapProduct);
  }

  @Query(() => ProductType, { nullable: true })
  async product(@Args('id') id: string): Promise<any> {
    // 1) Exact lookup by id via microservice / REST
    if (this.objectIdRegex.test(id)) {
      try {
        const result = await firstValueFrom(
          this.productClient.send('get_product', { id })
        );
        if (result) return this.mapProduct(result);
      } catch (e) {
        // ignore -> fallback
      }

      try {
        const res = await fetch(`${this.baseUrl}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) return this.mapProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product via REST:', error);
      }
    }

    // 2) Fallback: treat id as slug or legacy demo id
    const normalisedTarget = this.slugify(id);
    const candidates = await this.fetchProductsFromSources();
    const match = candidates.find((item) => {
      const rawId = this.extractId(item);
      if (rawId === id || rawId === normalisedTarget) return true;

      const candidateSlug = this.slugify(item.slug || item.name || rawId);
      return candidateSlug === normalisedTarget;
    });

    return match ? this.mapProduct(match) : null;
  }

  @Query(() => [ProductType])
  async productsByCategory(@Args('category') category: string): Promise<any[]> {
    const wanted = this.slugify(category);
    const all = await this.fetchProductsFromSources();
    return all
      .map(this.mapProduct)
      .filter((p) => this.slugify(p.category || p.displayCategory || '') === wanted);
  }

  @Mutation(() => ProductType)
  async createProduct(
    @Args('input') input: ProductInput,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const payload = {
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      stock: input.stock ?? 0,
      imageUrl: input.image,
    };

    const res = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create product (${res.status})`);
    }

    const created = await res.json();
    return this.mapProduct(created);
  }

  @Mutation(() => ProductType)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: ProductInput,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);
    const payload = {
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      stock: input.stock ?? 0,
      imageUrl: input.image,
    };

    const res = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update product (${res.status})`);
    }

    const updated = await res.json();
    return this.mapProduct(updated);
  }

  @Mutation(() => Boolean)
  async deleteProduct(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    this.ensureAdmin(context);

    const res = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      return false;
    }

    if (!res.ok) {
      throw new Error(`Failed to delete product (${res.status})`);
    }

    return true;
  }

  private mapProduct = (p: any) => ({
    id: this.extractId(p),
    slug: this.slugify(p.slug || p.name || this.extractId(p)),
    name: p.name,
    description: p.description,
    price: p.price,
    category: this.slugify(p.category || p.displayCategory || ''),
    categoryId: this.extractCategoryId(p.category),
    categoryName: this.extractCategoryName(p.category, p.displayCategory),
    image:
      p.image ||
      p.imageUrl ||
      (Array.isArray(p.images) ? p.images[0] : undefined),
    stock: p.stock,
    rating: p.rating,
    reviews: p.reviews,
    features: p.features,
    dimensions: p.dimensions,
    weight: p.weight,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    displayCategory:
      this.extractCategoryName(p.category, p.displayCategory) || p.displayCategory || p.category,
  });

  private extractId(input: any): string {
    if (!input) return '';
    if (typeof input.id === 'string' && input.id) return input.id;
    if (typeof input._id === 'string' && input._id) return input._id;
    if (input._id && typeof input._id.toHexString === 'function') {
      return input._id.toHexString();
    }
    return String(input.id || input._id || '');
  }

  private slugify(value: string) {
    return (value || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private extractCategoryId(category: any): string | undefined {
    if (!category) return undefined;
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return category.id || category._id?.toString?.();
    }
    return undefined;
  }

  private extractCategoryName(category: any, fallback?: string): string | undefined {
    if (!category) return fallback || undefined;
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return category.name || category.title || fallback || undefined;
    }
    return fallback || undefined;
  }

  private async fetchProductsFromSources(): Promise<any[]> {
    try {
      const result = await firstValueFrom(
        this.productClient.send('get_products', {})
      );
      if (Array.isArray(result) && result.length > 0) {
        return result;
      }
    } catch (error) {
      console.warn('ProductResolver: TCP fetch failed, fallback to REST', error?.message || error);
    }

    try {
      const res = await fetch(`${this.baseUrl}/products`);
      if (!res.ok) throw new Error(`REST /products returned ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('ProductResolver: REST fetch failed', error);
      return [];
    }
  }

  private ensureAdmin(context: any) {
    const isAdmin = context?.req?.user?.isAdmin;
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
  }
}
