export class CreateProductDto {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly productId?: number;
  readonly imageUrl?: string;
  readonly images?: string[];
  readonly brand?: string;
  readonly soldCount?: number;
  readonly averageRating?: number;
  readonly numReviews?: number;
  readonly legacyId?: number;
  readonly category?: string;
  readonly displayCategory?: string;
  readonly slug?: string;
  readonly stock?: number;
  readonly dimensions?: Record<string, any> | null;
  readonly features?: string[];
  readonly weight?: number;
}

export class UpdateProductDto extends CreateProductDto {}
