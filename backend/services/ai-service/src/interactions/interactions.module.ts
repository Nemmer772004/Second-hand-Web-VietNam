import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionEvent } from '../entities/interaction-event.entity';
import { SessionSequence } from '../entities/session-sequence.entity';
import { RlEpisodeStep } from '../entities/rl-episode-step.entity';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { InteractionsMessageController } from './interactions.message.controller';
import { UserMapping } from '../entities/user-mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InteractionEvent, SessionSequence, RlEpisodeStep, UserMapping])],
  controllers: [InteractionsController, InteractionsMessageController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
