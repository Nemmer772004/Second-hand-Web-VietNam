export class CreateProductDto {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly imageUrl?: string;
  readonly category: string;
  readonly stock: number;
}

export class UpdateProductDto extends CreateProductDto {}
