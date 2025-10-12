import {
  IsBoolean,
  IsISO8601,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { InteractionEventType } from '../../entities/interaction-event.entity';

const EVENT_TYPES: InteractionEventType[] = [
  'view',
  'click',
  'add_to_cart',
  'purchase',
  'reject',
  'out',
  'chat',
  'recommendation',
];

export class CreateInteractionDto {
  @IsOptional()
  @IsString()
  @Matches(/^[\w-]+$/, {
    message: 'userId chỉ được chứa ký tự chữ, số, "-" hoặc "_"',
  })
  userId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  sessionId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  productId?: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(EVENT_TYPES, {
    message: `eventType phải là một trong: ${EVENT_TYPES.join(', ')}`,
  })
  eventType!: InteractionEventType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsNumber()
  reward?: number;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsOptional()
  @IsNumber()
  stepNumber?: number;
}
