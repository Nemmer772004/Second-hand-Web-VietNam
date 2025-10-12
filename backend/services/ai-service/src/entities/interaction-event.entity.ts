import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type InteractionEventType =
  | 'view'
  | 'click'
  | 'add_to_cart'
  | 'purchase'
  | 'reject'
  | 'out'
  | 'chat'
  | 'recommendation';

@Entity('ai_interaction_events')
@Index(['userId', 'occurredAt'])
@Index(['sessionId'])
@Index(['sessionId', 'stepNumber'], { unique: true })
export class InteractionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sessionId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', length: 32 })
  eventType: InteractionEventType;

  @Column({ type: 'integer', name: 'step_number' })
  stepNumber: number;

  @Column({ type: 'double precision', name: 'delta_seconds', default: 0 })
  deltaSeconds: number;

  @Column({ type: 'double precision', default: 0 })
  reward: number;

  @Column({ type: 'boolean', default: false })
  done: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'timestamp with time zone' })
  occurredAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
