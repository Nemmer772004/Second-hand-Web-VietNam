import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInteractionDto } from './create-interaction.dto';

export class BulkCreateInteractionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateInteractionDto)
  events!: CreateInteractionDto[];
}
