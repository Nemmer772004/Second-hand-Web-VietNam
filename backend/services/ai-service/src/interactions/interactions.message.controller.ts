import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Controller()
export class InteractionsMessageController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @MessagePattern('ai.log_interaction')
  async logInteraction(@Payload() data: CreateInteractionDto) {
    return this.interactionsService.logInteraction(data);
  }

  @MessagePattern('ai.log_interactions')
  async logInteractions(@Payload() data: { events: CreateInteractionDto[] }) {
    const events = Array.isArray(data?.events) ? data.events : [];
    return this.interactionsService.logInteractions(events);
  }
}
