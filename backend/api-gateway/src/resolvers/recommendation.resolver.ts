import {
  Resolver,
  Query,
  Args,
  ObjectType,
  Field,
  Float,
  Int,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { fetchWithRetry } from '../utils/http';

const DEFAULT_TIMEOUT = 1_500;
const DEFAULT_TOPK = 5;

@ObjectType()
class RecommendationProductType {
  @Field()
  productId!: string;

  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  productSlug?: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Float, { nullable: true })
  score?: number;
}

@ObjectType()
class RecommendationResultType {
  @Field()
  userId!: string;

  @Field({ nullable: true })
  reply?: string;

  @Field()
  generatedAt!: string;

  @Field(() => [RecommendationProductType])
  items!: RecommendationProductType[];
}

@Resolver()
export class RecommendationResolver {
  private readonly recommenderUrl: string;
  private readonly productHttpBase: string;

  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {
    const recommender =
      process.env.RECOMMENDER_SERVICE_URL ||
      process.env.CHATBOT_SERVICE_URL ||
      'http://localhost:8008';

    const productHost = process.env.PRODUCT_SERVICE_HOST || 'localhost';
    const productPort = process.env.PRODUCT_SERVICE_PORT || '3001';
    const productUrlEnv = process.env.PRODUCT_SERVICE_URL;

    this.recommenderUrl = recommender.replace(/\/$/, '');
    this.productHttpBase = (productUrlEnv || `http://${productHost}:${productPort}`).replace(/\/$/, '');
  }

  private normaliseId(value: unknown): string {
    if (value == null) {
      return '';
    }
    if (typeof value === 'string') {
      return value.trim();
    }
    return String(value).trim();
  }

  private toNumber(value: any): number | undefined {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return undefined;
    }
    return parsed;
  }

  private async fetchProductDetail(productToken: string) {
    const trimmed = this.normaliseId(productToken);
    if (!trimmed) {
      return null;
    }

    const candidates: Array<() => Promise<any>> = [];

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      candidates.push(async () =>
        firstValueFrom(
          this.productClient
            .send('get_product_by_product_id', { productId: numeric })
            .pipe(timeout(DEFAULT_TIMEOUT)),
        ),
      );
    }

    candidates.push(async () =>
      firstValueFrom(
        this.productClient
          .send('get_product', { id: trimmed })
          .pipe(timeout(DEFAULT_TIMEOUT)),
      ),
    );

    candidates.push(async () => {
      const res = await fetchWithRetry(`${this.productHttpBase}/products/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    });

    for (const attempt of candidates) {
      try {
        const result = await attempt();
        if (result) {
          return result;
        }
      } catch (error) {
        /* ignore and try next */
      }
    }

    return null;
  }

  private mapProduct(raw: any, fallbackName: string | undefined): RecommendationProductType {
    if (!raw || typeof raw !== 'object') {
      return {
        productId: this.normaliseId(raw?.id || raw?._id || ''),
        productName: fallbackName,
        score: undefined,
      };
    }

    const id =
      this.normaliseId(raw.id) ||
      this.normaliseId(raw._id) ||
      this.normaliseId(raw.productId) ||
      this.normaliseId(raw.product_id);

    const priceNumber =
      typeof raw.price === 'number'
        ? raw.price
        : typeof raw.price === 'string'
        ? this.toNumber(raw.price.replace(/[^0-9.-]/g, ''))
        : undefined;

    return {
      productId: id || this.normaliseId(raw.productId) || this.normaliseId(raw.product_id),
      productName: raw.name || fallbackName,
      productSlug: raw.slug || raw.legacyId || undefined,
      image:
        (Array.isArray(raw.images) && raw.images.length > 0 && raw.images[0]) ||
        raw.image ||
        raw.imageUrl ||
        undefined,
      price: priceNumber,
      score: undefined,
    };
  }

  @Query(() => RecommendationResultType)
  async recommendations(
    @Args('userId') userId: string,
    @Args('topK', { type: () => Int, nullable: true }) topK?: number,
  ): Promise<RecommendationResultType> {
    const trimmedUserId = this.normaliseId(userId);
    if (!trimmedUserId) {
      throw new Error('userId không được để trống');
    }

    const limit = topK && topK > 0 ? Math.min(topK, 20) : DEFAULT_TOPK;

    const response = await fetchWithRetry(`${this.recommenderUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Gợi ý sản phẩm từ hệ thống',
        user_id: trimmedUserId,
        top_k: limit,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = payload?.detail || payload?.message || 'Không thể lấy gợi ý sản phẩm';
      throw new Error(detail);
    }

    const rawItems: any[] = Array.isArray(payload?.recommendations)
      ? payload.recommendations
      : [];

    const mappedItems: RecommendationProductType[] = [];

    for (const item of rawItems) {
      const itemToken =
        this.normaliseId(item?.item_id) ||
        this.normaliseId(item?.itemId) ||
        this.normaliseId(item?.productId);

      if (!itemToken) {
        continue;
      }

      const fallbackName =
        item?.item_name || item?.itemName || item?.productName || undefined;
      const productDetail = await this.fetchProductDetail(itemToken);
      const mapped = this.mapProduct(productDetail, fallbackName);

      mapped.score =
        typeof item?.score === 'number'
          ? item.score
          : this.toNumber(item?.score);

      if (!mapped.productId) {
        mapped.productId = itemToken;
      }

      mappedItems.push(mapped);
    }

    return {
      userId: trimmedUserId,
      reply: payload?.reply || undefined,
      generatedAt: new Date().toISOString(),
      items: mappedItems,
    };
  }
}
