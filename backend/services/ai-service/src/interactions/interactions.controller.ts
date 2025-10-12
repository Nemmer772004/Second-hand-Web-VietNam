import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { BulkCreateInteractionsDto } from './dto/bulk-create-interactions.dto';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get()
  async list(
    @Query('limit') limitParam?: string,
    @Query('offset') offsetParam?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 200);
    const offset = Math.max(parseInt(offsetParam ?? '0', 10) || 0, 0);

    const { events, total } = await this.interactionsService.listInteractions(limit, offset);

    return {
      total,
      limit,
      offset,
      events,
    };
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async createOne(@Body() body: CreateInteractionDto) {
    const saved = await this.interactionsService.logInteraction(body);
    return { id: saved.id, createdAt: saved.createdAt, occurredAt: saved.occurredAt };
  }

  @Post('bulk')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async createBulk(@Body() body: BulkCreateInteractionsDto) {
    const saved = await this.interactionsService.logInteractions(body.events);
    return {
      created: saved.length,
      ids: saved.map((record) => record.id),
    };
  }
}
