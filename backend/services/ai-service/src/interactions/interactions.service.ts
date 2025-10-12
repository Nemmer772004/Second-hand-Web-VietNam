import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InteractionEvent,
  InteractionEventType,
} from '../entities/interaction-event.entity';
import { SessionSequence } from '../entities/session-sequence.entity';
import { RlEpisodeStep } from '../entities/rl-episode-step.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';

type NormalisedEvent = {
  userId: string | null;
  sessionId: string | null;
  productId: string | null;
  eventType: InteractionEventType;
  metadata: Record<string, any> | null;
  occurredAt: Date;
  reward: number;
  done: boolean;
  requestedStepNumber: number | null;
};

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);
  private readonly rewardDefaults: Record<InteractionEventType, number> = {
    view: 0,
    click: 0.1,
    add_to_cart: 0.4,
    purchase: 1,
    reject: -0.3,
    out: -0.2,
    chat: 0.05,
    recommendation: 0.02,
  };

  constructor(
    @InjectRepository(InteractionEvent)
    private readonly interactionsRepository: Repository<InteractionEvent>,
    @InjectRepository(SessionSequence)
    private readonly sessionSequenceRepository: Repository<SessionSequence>,
    @InjectRepository(RlEpisodeStep)
    private readonly rlEpisodeStepRepository: Repository<RlEpisodeStep>,
  ) {}

  async logInteraction(payload: CreateInteractionDto) {
    const [saved] = await this.logInteractions([payload]);
    return saved;
  }

  async logInteractions(
    events: CreateInteractionDto[],
  ): Promise<InteractionEvent[]> {
    const normalised = events
      .map((event) => this.normaliseEvent(event))
      .filter((event): event is NormalisedEvent => event !== null);

    if (!normalised.length) {
      return [];
    }

    normalised.sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
    );

    const grouped = this.groupBySessionKey(normalised);
    const savedAll: InteractionEvent[] = [];

    for (const [, batch] of grouped) {
      const saved = await this.persistBatch(batch);
      savedAll.push(...saved);
    }

    this.logger.debug?.(
      `Logged ${savedAll.length} interaction events with hierarchical aggregations`,
    );

    return savedAll;
  }

  async listInteractions(limit = 50, offset = 0) {
    const take = Math.min(Math.max(limit, 1), 200);
    const skip = Math.max(offset, 0);

    const [events, total] = await this.interactionsRepository.findAndCount({
      order: { occurredAt: 'DESC', createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      events,
      total,
    };
  }

  private normaliseEvent(payload: CreateInteractionDto): NormalisedEvent | null {
    const occurredAt = payload.occurredAt
      ? new Date(payload.occurredAt)
      : new Date();

    if (Number.isNaN(occurredAt.getTime())) {
      this.logger.warn(`Bỏ qua sự kiện vì occurredAt không hợp lệ: ${payload.occurredAt}`);
      return null;
    }

    const sessionId =
      typeof payload.sessionId === 'string' && payload.sessionId.trim().length
        ? payload.sessionId.trim()
        : null;

    const metadata =
      payload.metadata && typeof payload.metadata === 'object'
        ? payload.metadata
        : null;

    return {
      userId:
        typeof payload.userId === 'string' && payload.userId.trim().length
          ? payload.userId.trim()
          : null,
      sessionId,
      productId:
        typeof payload.productId === 'string' && payload.productId.trim().length
          ? payload.productId.trim()
          : null,
      eventType: payload.eventType,
      metadata,
      occurredAt,
      reward: this.resolveReward(payload),
      done: this.resolveDone(payload),
      requestedStepNumber:
        typeof payload.stepNumber === 'number' && Number.isFinite(payload.stepNumber)
          ? Math.max(1, Math.floor(payload.stepNumber))
          : null,
    };
  }

  private resolveReward(payload: CreateInteractionDto): number {
    if (typeof payload.reward === 'number' && Number.isFinite(payload.reward)) {
      return payload.reward;
    }

    const metadataReward = (payload.metadata as Record<string, unknown>)?.reward;
    if (typeof metadataReward === 'number' && Number.isFinite(metadataReward)) {
      return metadataReward;
    }

    return this.rewardDefaults[payload.eventType] ?? 0;
  }

  private resolveDone(payload: CreateInteractionDto): boolean {
    if (typeof payload.done === 'boolean') {
      return payload.done;
    }

    const metadataDone = (payload.metadata as Record<string, unknown>)?.done;
    if (typeof metadataDone === 'boolean') {
      return metadataDone;
    }

    return payload.eventType === 'purchase' || payload.eventType === 'out';
  }

  private groupBySessionKey(events: NormalisedEvent[]) {
    const map = new Map<string, NormalisedEvent[]>();

    for (const event of events) {
      const key =
        event.sessionId ??
        (event.userId ? `user:${event.userId}` : 'anonymous_session');
      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    }

    return map;
  }

  private async persistBatch(events: NormalisedEvent[]): Promise<InteractionEvent[]> {
    if (!events.length) {
      return [];
    }

    const sessionId = events[0].sessionId ?? null;
    const userId = events[0].userId ?? null;

    let lastStepNumber = 0;
    let lastOccurredAt: Date | null = null;
    let existingSequence: SessionSequence | null = null;

    if (sessionId) {
      const lastEvent = await this.interactionsRepository.findOne({
        where: { sessionId },
        order: { stepNumber: 'DESC' },
      });

      if (lastEvent) {
        lastStepNumber = lastEvent.stepNumber;
        lastOccurredAt = lastEvent.occurredAt;
      }

      existingSequence = await this.sessionSequenceRepository.findOne({
        where: { sessionId },
      });
    }

    let previousOccurredAt = lastOccurredAt;
    let stepCounter = lastStepNumber;

    const entities = events.map((event) => {
      const occurredAt = event.occurredAt;
      let stepNumber = stepCounter + 1;

      if (
        event.requestedStepNumber != null &&
        event.requestedStepNumber > stepCounter
      ) {
        stepNumber = event.requestedStepNumber;
      }

      stepCounter = stepNumber;

      const deltaSeconds = previousOccurredAt
        ? Math.max(
            0,
            (occurredAt.getTime() - previousOccurredAt.getTime()) / 1000,
          )
        : 0;

      previousOccurredAt = occurredAt;

      return this.interactionsRepository.create({
        userId: event.userId,
        sessionId,
        productId: event.productId,
        eventType: event.eventType,
        metadata: event.metadata,
        occurredAt,
        reward: event.reward,
        done: event.done,
        stepNumber,
        deltaSeconds,
      });
    });

    const saved = await this.interactionsRepository.save(entities);

    if (sessionId) {
      await this.updateSessionSequence(sessionId, userId, saved, existingSequence);
      await this.recordRlEpisodes(sessionId, userId, saved, existingSequence);
    }

    return saved;
  }

  private async updateSessionSequence(
    sessionId: string,
    userId: string | null,
    events: InteractionEvent[],
    existingSequence: SessionSequence | null,
  ) {
    if (!events.length) {
      return;
    }

    const sorted = [...events].sort(
      (a, b) => a.stepNumber - b.stepNumber,
    );

    const sequence =
      existingSequence ??
      this.sessionSequenceRepository.create({
        sessionId,
        userId,
        startedAt: sorted[0].occurredAt,
        completedAt: null,
        length: 0,
        actionSequence: [],
        productSequence: [],
        timeSequence: [],
        rewardSequence: [],
        metadata: null,
      });

    if (!sequence.startedAt) {
      sequence.startedAt = sorted[0].occurredAt;
    }

    if (!sequence.actionSequence) {
      sequence.actionSequence = [];
    }
    if (!sequence.productSequence) {
      sequence.productSequence = [];
    }
    if (!sequence.timeSequence) {
      sequence.timeSequence = [];
    }
    if (!sequence.rewardSequence) {
      sequence.rewardSequence = [];
    }

    if (!sequence.userId && userId) {
      sequence.userId = userId;
    }

    const baseTimestamp = sequence.startedAt;

    for (const event of sorted) {
      sequence.actionSequence.push(event.eventType);
      sequence.productSequence.push(event.productId ?? '');
      sequence.rewardSequence.push(event.reward ?? 0);

      const elapsedSeconds =
        (event.occurredAt.getTime() - baseTimestamp.getTime()) / 1000;
      sequence.timeSequence.push(Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);

      if (event.done) {
        sequence.completedAt = event.occurredAt;
      }
    }

    sequence.length = sequence.actionSequence.length;

    await this.sessionSequenceRepository.save(sequence);
  }

  private async recordRlEpisodes(
    sessionId: string,
    userId: string | null,
    events: InteractionEvent[],
    existingSequence: SessionSequence | null,
  ) {
    if (!events.length) {
      return;
    }

    const sorted = [...events].sort(
      (a, b) => a.stepNumber - b.stepNumber,
    );

    const history =
      existingSequence?.actionSequence?.slice() ??
      [];

    const steps = sorted.map((event) => {
      const stateHistory = [...history];
      const nextHistory = [...history, event.eventType];

      const state = {
        history: stateHistory,
        length: stateHistory.length,
      };

      const nextState = {
        history: nextHistory,
        length: nextHistory.length,
      };

      history.push(event.eventType);

      return this.rlEpisodeStepRepository.create({
        episodeId: sessionId,
        userId,
        stepNumber: event.stepNumber,
        state,
        action: event.eventType,
        reward: event.reward ?? 0,
        nextState,
        done: event.done,
        occurredAt: event.occurredAt,
        metadata: {
          productId: event.productId,
          deltaSeconds: event.deltaSeconds,
          rawMetadata: event.metadata ?? undefined,
        },
      });
    });

    if (!steps.length) {
      return;
    }

    await this.rlEpisodeStepRepository.upsert(steps, ['episodeId', 'stepNumber']);
  }
}
