import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>
  ) {}

  async findAll(): Promise<any[]> {
    const docs = await this.productModel.find().lean().exec();
    return Promise.all(docs.map((doc) => this.attachReviews(doc)));
  }

  async findOne(id: string): Promise<any> {
    const productDoc = await this.productModel.findById(id).lean().exec();
    if (!productDoc) {
      return null;
    }

    const normalized = this.normalizeProductDocument(productDoc);
    return this.attachReviews(normalized);
  }

  private resolveNumericProductId(product: Record<string, any>): number | undefined {
    const candidates = [
      product.productId,
      product.product_id,
      product.legacyId,
      product.legacy_id,
      product.legacyID,
    ];

    for (const candidate of candidates) {
      const value = Number(candidate);
      if (!Number.isNaN(value)) {
        return value;
      }
    }

    return undefined;
  }

  async findByProductId(productId: number): Promise<any | null> {
    if (productId == null || Number.isNaN(Number(productId))) {
      return null;
    }

    const value = Number(productId);

    const document = await this.productModel
      .findOne({
        $or: [
          { productId: value },
          { product_id: value },
          { legacyId: value },
          { legacy_id: value },
        ],
      })
      .lean()
      .exec();

    if (!document) {
      return null;
    }

    const normalized = this.normalizeProductDocument(document);
    return this.attachReviews(normalized);
  }

  private async attachReviews(productDoc: any): Promise<any> {
    const product = this.normalizeProductDocument(productDoc);
    const productNumericId = this.resolveNumericProductId(product);

    if (productNumericId == null) {
      return product;
    }

    const productIdMatchValues = [
      productNumericId,
      String(productNumericId),
    ];

    let reviewsRaw = await this.reviewModel
      .find({
        $or: [
          { productId: { $in: productIdMatchValues } },
          { product_id: { $in: productIdMatchValues } },
        ],
      })
      .sort({ reviewId: 1 })
      .lean()
      .exec();

    if (!reviewsRaw.length) {
      const rawCollection = await this.reviewModel.collection
        .find({
          $or: [
            { product_id: { $in: productIdMatchValues } },
            { productId: { $in: productIdMatchValues } },
          ],
        })
        .sort({ review_id: 1 })
        .toArray();
      reviewsRaw = rawCollection as any[];
    }

    const reviews = reviewsRaw.map((review) => this.normalizeReviewDocument(review));

    const reviewCount = reviews.length;
    const calculatedAverage =
      reviewCount > 0
        ? reviews.reduce((total, review) => total + Number(review.star || 0), 0) / reviewCount
        : undefined;

    return {
      ...product,
      reviews,
      numReviews: reviewCount,
      reviewCount,
      averageRating:
        reviewCount > 0
          ? calculatedAverage
          : typeof product.averageRating === 'number'
            ? product.averageRating
            : undefined,
    };
  }

  private normalizeProductDocument(doc: any): Record<string, any> {
    if (!doc) {
      return doc;
    }

    const normalized: Record<string, any> = { ...doc };

    normalized.productId = this.toNumber(
      doc.productId ?? doc.product_id ?? doc.legacyId ?? doc.legacy_id
    );
    normalized.legacyId = this.toNumber(doc.legacyId ?? doc.legacy_id);
    normalized.soldCount = this.toNumber(doc.soldCount ?? doc.sold_count);
    normalized.averageRating = this.toNumber(doc.averageRating ?? doc.average_rating);
    normalized.numReviews = this.toNumber(doc.numReviews ?? doc.num_reviews);
    normalized.stock = this.toNumber(doc.stock) ?? 0;
    normalized.price = this.toNumber(doc.price) ?? doc.price;
    normalized.images = this.normalizeImages(doc.images);
    normalized.imageUrl = doc.imageUrl ?? doc.image_url ?? normalized.images[0] ?? doc.image;
    normalized.displayCategory = doc.displayCategory ?? doc.display_category ?? doc.category;
    normalized.createdAt = doc.createdAt ?? doc.created_at ?? doc.created_at?.toISOString?.();
    normalized.updatedAt = doc.updatedAt ?? doc.updated_at ?? doc.updated_at?.toISOString?.();

    return normalized;
  }

  private normalizeReviewDocument(review: any): Record<string, any> {
    const normalized: Record<string, any> = { ...review };

    normalized.reviewId = this.toNumber(review.reviewId ?? review.review_id);
    normalized.productId = this.toNumber(review.productId ?? review.product_id);
    normalized.star = this.toNumber(review.star) ?? 0;
    normalized.reviewerName = review.reviewerName ?? review.reviewer_name ?? '';
    normalized.content = review.content ?? '';
    normalized.time = review.time ?? review.createdAt ?? review.created_at ?? null;
    normalized.variation = review.variation ?? review.variant ?? null;
    normalized.likedCount = this.toNumber(review.likedCount ?? review.liked_count) ?? 0;
    normalized.images = this.normalizeImages(review.images);
    normalized.shopReply = review.shopReply ?? review.shop_reply ?? null;

    return normalized;
  }

  private normalizeImages(images: any): string[] {
    if (!images) {
      return [];
    }

    if (Array.isArray(images)) {
      return Array.from(
        new Set(
          images
            .flatMap((item) =>
              typeof item === 'string'
                ? item
                    .split('|')
                    .map((url) => url.trim())
                    .filter(Boolean)
                : []
            )
        )
      );
    }

    if (typeof images === 'string') {
      return images
        .split('|')
        .map((url) => url.trim())
        .filter(Boolean);
    }

    return [];
  }

  private toNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
       if (!createProductDto?.name || createProductDto?.name.trim().length === 0) {
        throw new Error('Name is a required field');
      }

      if (createProductDto?.price == null || Number.isNaN(Number(createProductDto.price))) {
        throw new Error('Price is a required numeric field');
      }

      if (createProductDto.price < 0) {
        throw new Error('Price must be a positive number');
      }

      const now = new Date();

      const normalizedPayload: Partial<Product> = {
        ...createProductDto,
        productId:
          createProductDto.productId != null && !Number.isNaN(Number(createProductDto.productId))
            ? Number(createProductDto.productId)
            : undefined,
        price: Number(createProductDto.price),
        stock: createProductDto.stock != null ? Number(createProductDto.stock) : 0,
        soldCount: createProductDto.soldCount != null ? Number(createProductDto.soldCount) : 0,
        averageRating: createProductDto.averageRating != null ? Number(createProductDto.averageRating) : 0,
        numReviews: createProductDto.numReviews != null ? Number(createProductDto.numReviews) : 0,
        legacyId: createProductDto.legacyId != null ? Number(createProductDto.legacyId) : undefined,
        images: Array.isArray(createProductDto.images)
          ? createProductDto.images.filter((url) => typeof url === 'string' && url.trim().length > 0)
          : [],
        features: Array.isArray(createProductDto.features)
          ? createProductDto.features.filter((feature) => typeof feature === 'string' && feature.trim().length > 0)
          : [],
        dimensions:
          createProductDto.dimensions && typeof createProductDto.dimensions === 'object'
            ? createProductDto.dimensions
            : null,
        createdAt: now,
        updatedAt: now,
      };

      if (!normalizedPayload.imageUrl && normalizedPayload.images && normalizedPayload.images.length > 0) {
        normalizedPayload.imageUrl = normalizedPayload.images[0];
      }

      const createdProduct = new this.productModel({
        ...normalizedPayload,
      });

      // Save and handle potential MongoDB errors
      const savedProduct = await createdProduct.save();
      console.log('Product saved successfully:', savedProduct);
      return savedProduct;
    } catch (error) {
      console.error('Error in create product service:', {
        dto: createProductDto,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const normalizedPayload: Partial<Product> = {
      ...updateProductDto,
      price:
        updateProductDto.price != null && !Number.isNaN(Number(updateProductDto.price))
          ? Number(updateProductDto.price)
          : undefined,
      productId:
        updateProductDto.productId != null && !Number.isNaN(Number(updateProductDto.productId))
          ? Number(updateProductDto.productId)
          : undefined,
      stock:
        updateProductDto.stock != null && !Number.isNaN(Number(updateProductDto.stock))
          ? Number(updateProductDto.stock)
          : undefined,
      soldCount:
        updateProductDto.soldCount != null && !Number.isNaN(Number(updateProductDto.soldCount))
          ? Number(updateProductDto.soldCount)
          : undefined,
      averageRating:
        updateProductDto.averageRating != null && !Number.isNaN(Number(updateProductDto.averageRating))
          ? Number(updateProductDto.averageRating)
          : undefined,
      numReviews:
        updateProductDto.numReviews != null && !Number.isNaN(Number(updateProductDto.numReviews))
          ? Number(updateProductDto.numReviews)
          : undefined,
      legacyId:
        updateProductDto.legacyId != null && !Number.isNaN(Number(updateProductDto.legacyId))
          ? Number(updateProductDto.legacyId)
          : undefined,
      images: Array.isArray(updateProductDto.images)
        ? updateProductDto.images.filter((url) => typeof url === 'string' && url.trim().length > 0)
        : undefined,
      features: Array.isArray(updateProductDto.features)
        ? updateProductDto.features.filter((feature) => typeof feature === 'string' && feature.trim().length > 0)
        : undefined,
      dimensions:
        updateProductDto.dimensions && typeof updateProductDto.dimensions === 'object'
          ? updateProductDto.dimensions
          : undefined,
    };

    if (
      (!normalizedPayload.imageUrl || normalizedPayload.imageUrl.trim().length === 0) &&
      normalizedPayload.images &&
      normalizedPayload.images.length > 0
    ) {
      normalizedPayload.imageUrl = normalizedPayload.images[0];
    }

    return this.productModel
      .findByIdAndUpdate(
        id,
        { ...normalizedPayload, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
