import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIRecommendation } from './entities/recommendation.entity';
import { InteractionEvent } from './entities/interaction-event.entity';
import { SessionSequence } from './entities/session-sequence.entity';
import { RlEpisodeStep } from './entities/rl-episode-step.entity';
import { InteractionsModule } from './interactions/interactions.module';
import { HealthController } from './health.controller';
import { UserMapping } from './entities/user-mapping.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('AI_PG_HOST', 'localhost'),
        port: Number(config.get<string>('AI_PG_PORT', '5432')),
        username: config.get<string>('AI_PG_USER', 'nemmer'),
        password: config.get<string>('AI_PG_PASSWORD', 'nemmer'),
        database: config.get<string>('AI_PG_DB', 'secondhand_ai'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('AI_PG_SYNC', true),
        logging: config.get<boolean>('AI_PG_LOGGING', false),
        entities: [AIRecommendation, InteractionEvent, SessionSequence, RlEpisodeStep, UserMapping],
      }),
    }),
    InteractionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
