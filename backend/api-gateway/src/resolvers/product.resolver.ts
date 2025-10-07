import { Resolver, Query, Args, ObjectType, Field, InputType, Mutation, Context, Int, Float } from '@nestjs/graphql';
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
class ReviewType {
  @Field(() => Int)
  reviewId: number;

  @Field(() => Float)
  star: number;

  @Field()
  reviewerName: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  variation?: string;

  @Field(() => Int, { nullable: true })
  likedCount?: number;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  shopReply?: string | null;
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

  @Field(() => Float)
  price: number;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  categoryName?: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => Int, { nullable: true })
  stock?: number;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Float, { nullable: true })
  averageRating?: number;

  @Field(() => Int, { nullable: true })
  reviewCount?: number;

  @Field(() => [ReviewType], { nullable: true })
  reviews?: ReviewType[];

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => DimensionsType, { nullable: true })
  dimensions?: DimensionsType;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => Int, { nullable: true })
  soldCount?: number;

  @Field(() => Int, { nullable: true })
  legacyId?: number;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;

  @Field({ nullable: true })
  displayCategory?: string;
}

@InputType()
class DimensionsInput {
  @Field(() => Float, { nullable: true })
  width?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  depth?: number;
}

@InputType()
class ProductInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  category: string;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Int, { nullable: true })
  stock?: number;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => Int, { nullable: true })
  soldCount?: number;

  @Field(() => Float, { nullable: true })
  averageRating?: number;

  @Field(() => Int, { nullable: true })
  numReviews?: number;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field({ nullable: true })
  displayCategory?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field(() => Int, { nullable: true })
  legacyId?: number;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => DimensionsInput, { nullable: true })
  dimensions?: DimensionsInput;
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
    const numericId = this.parseNumber(id);

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

    if (numericId != null) {
      const byProductId = await this.fetchProductDetailByProductId(numericId);
      if (byProductId) {
        return this.mapProduct(byProductId);
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

    if (!match) {
      return null;
    }

    const detailed = await this.fetchProductDetailByObjectId(this.extractId(match));
    if (detailed) {
      return this.mapProduct(detailed);
    }

    const numericIdentifier = this.parseNumber(
      match.productId ??
      match.product_id ??
      match.legacyId ??
      match.legacy_id
    );
    if (numericIdentifier != null) {
      const detailedByProductId = await this.fetchProductDetailByProductId(numericIdentifier);
      if (detailedByProductId) {
        return this.mapProduct(detailedByProductId);
      }
    }

    return this.mapProduct(match);
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
      productId: input.productId,
      stock: input.stock ?? 0,
      imageUrl: input.image,
      brand: input.brand,
      soldCount: input.soldCount,
      averageRating: input.averageRating,
      numReviews: input.numReviews,
      images: input.images,
      displayCategory: input.displayCategory,
      slug: input.slug,
      legacyId: input.legacyId,
      features: input.features,
      dimensions: input.dimensions,
      weight: input.weight,
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
      productId: input.productId,
      stock: input.stock ?? 0,
      imageUrl: input.image,
      brand: input.brand,
      soldCount: input.soldCount,
      averageRating: input.averageRating,
      numReviews: input.numReviews,
      images: input.images,
      displayCategory: input.displayCategory,
      slug: input.slug,
      legacyId: input.legacyId,
      features: input.features,
      dimensions: input.dimensions,
      weight: input.weight,
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

  private mapProduct = (p: any) => {
    const images = Array.isArray(p.images) ? p.images : undefined;
    const reviewsArray = Array.isArray(p.reviews) ? p.reviews : [];
    const averageRating = this.parseNumber(p.averageRating ?? p.rating ?? p.average_rating);
    const productId = this.parseNumber(p.productId ?? p.product_id ?? p.legacyId ?? p.legacy_id);
    const explicitReviewCount = this.parseNumber(
      p.reviewCount ??
      p.reviewsCount ??
      p.numReviews ??
      p.num_reviews ??
      (!reviewsArray ? undefined : reviewsArray.length)
    );
    const reviewCount = explicitReviewCount ?? reviewsArray?.length;

    return {
      id: this.extractId(p),
      slug: this.slugify(p.slug || p.name || this.extractId(p)),
      name: p.name,
      description: p.description,
      price: this.parseNumber(p.price) ?? 0,
      category: this.slugify(p.category || p.displayCategory || ''),
      categoryId: this.extractCategoryId(p.category),
      categoryName: this.extractCategoryName(p.category, p.displayCategory),
      image: p.image || p.imageUrl || (images ? images[0] : undefined),
      images,
      stock: this.parseNumber(p.stock),
      rating: averageRating,
      averageRating,
      reviewCount: reviewCount ?? reviewsArray.length ?? 0,
      reviews: reviewsArray.length ? reviewsArray.map(this.mapReview) : [],
      features: Array.isArray(p.features) ? p.features : undefined,
      dimensions: p.dimensions ?? null,
      weight: this.parseNumber(p.weight),
      brand: p.brand,
      soldCount: this.parseNumber(p.soldCount ?? p.sold_count),
      legacyId: this.parseNumber(p.legacyId ?? p.legacy_id),
      productId: productId ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      displayCategory:
        this.extractCategoryName(p.category, p.displayCategory) || p.displayCategory || p.category,
    };
  };

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

  private parseNumber(value: any): number | undefined {
    if (value == null) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private async fetchProductDetailByObjectId(id: string): Promise<any | null> {
    if (!id || !this.objectIdRegex.test(id)) {
      return null;
    }

    try {
      const result = await firstValueFrom(
        this.productClient.send('get_product', { id })
      );
      if (result) {
        return result;
      }
    } catch (error) {
      // ignore and fallback
    }

    try {
      const res = await fetch(`${this.baseUrl}/products/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('ProductResolver: fetchProductDetailByObjectId REST failed', error);
    }

    return null;
  }

  private async fetchProductDetailByProductId(productId: number): Promise<any | null> {
    if (productId == null || Number.isNaN(Number(productId))) {
      return null;
    }

    try {
      const result = await firstValueFrom(
        this.productClient.send('get_product_by_product_id', { productId })
      );
      if (result) {
        return result;
      }
    } catch (error) {
      console.error('ProductResolver: TCP fetch by productId failed', error?.message || error);
    }

    return null;
  }

  private mapReview = (review: any): ReviewType => {
    const reviewId = this.parseNumber(review.reviewId ?? review.review_id);

    return {
      reviewId: reviewId != null ? Math.trunc(reviewId) : 0,
      star: this.parseNumber(review.star) ?? 0,
      reviewerName: review.reviewerName ?? review.reviewer_name ?? '',
      content: review.content,
      time: review.time,
      variation: review.variation,
      likedCount: this.parseNumber(review.likedCount ?? review.liked_count),
      images: Array.isArray(review.images)
        ? review.images
            .flatMap((item: unknown) =>
              typeof item === 'string'
                ? item.split('|').map((url) => url.trim()).filter(Boolean)
                : []
            )
        : typeof review.images === 'string'
          ? review.images.split('|').map((url: string) => url.trim()).filter(Boolean)
          : undefined,
      shopReply: review.shopReply ?? review.shop_reply ?? null,
    };
  };
}
