import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

const DEFAULT_TIMEOUT = 2000;

@InputType()
class RecordInteractionInput {
  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  sessionId?: string;

  @Field({ nullable: true })
  productId?: string;

  @Field()
  eventType!: string;

  @Field(() => String, { nullable: true, description: 'ISO timestamp' })
  occurredAt?: string;

  @Field(() => String, { nullable: true, description: 'JSON string metadata' })
  metadata?: string;
}

@ObjectType()
class RecordInteractionPayload {
  @Field()
  id!: string;

  @Field()
  occurredAt!: string;

  @Field()
  createdAt!: string;
}

@InputType()
class RecordInteractionsInput {
  @Field(() => [RecordInteractionInput])
  events!: RecordInteractionInput[];
}

@ObjectType()
class RecordInteractionsResult {
  @Field()
  created!: number;

  @Field(() => [String])
  ids!: string[];
}

@Resolver()
export class AIResolver {
  constructor(
    @Inject('AI_SERVICE')
    private readonly aiClient: ClientProxy,
  ) {}

  private ensureUserId(
    inputUserId: string | undefined,
    context: any,
  ): string | undefined {
    if (inputUserId && inputUserId.trim()) {
      return inputUserId;
    }
    const userId =
      context?.req?.user?.id ||
      context?.req?.user?._id ||
      context?.req?.headers?.['x-user-id'];
    return userId ? String(userId) : undefined;
  }

  private parseMetadata(raw?: string): Record<string, any> | undefined {
    if (typeof raw !== 'string' || !raw.trim()) {
      return undefined;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error('metadata phải là chuỗi JSON hợp lệ');
    }
  }

  @Mutation(() => RecordInteractionPayload)
  async recordInteraction(
    @Args('input') input: RecordInteractionInput,
    @Context() context: any,
  ) {
    const userId = this.ensureUserId(input.userId, context);
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được userId cho hành vi cần lưu.',
      );
    }

    const metadata = this.parseMetadata(input.metadata);

    const payload = {
      ...input,
      userId,
      metadata,
    };

    const response = await firstValueFrom(
      this.aiClient
        .send('ai.log_interaction', payload)
        .pipe(timeout(DEFAULT_TIMEOUT)),
    );

    return {
      id: response?.id,
      occurredAt: response?.occurredAt ?? new Date().toISOString(),
      createdAt: response?.createdAt ?? new Date().toISOString(),
    };
  }

  @Mutation(() => RecordInteractionsResult)
  async recordInteractions(
    @Args('input') input: RecordInteractionsInput,
    @Context() context: any,
  ) {
    if (!Array.isArray(input.events) || input.events.length === 0) {
      throw new Error('Danh sách events không được để trống.');
    }

    const events = input.events.map((event) => ({
      ...event,
      userId: this.ensureUserId(event.userId, context),
      metadata: this.parseMetadata(event.metadata),
    }));

    events.forEach((event, index) => {
      if (!event.userId) {
        throw new UnauthorizedException(
          `Không xác định được userId cho event vị trí ${index}.`,
        );
      }
    });

    const response = await firstValueFrom(
      this.aiClient
        .send('ai.log_interactions', { events })
        .pipe(timeout(DEFAULT_TIMEOUT)),
    );

    return {
      created: response?.length ?? 0,
      ids: Array.isArray(response)
        ? response.map((item: any) => item?.id).filter(Boolean)
        : [],
    };
  }
}
