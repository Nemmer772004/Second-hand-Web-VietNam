import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_rl_episode_steps')
@Index(['episodeId'])
@Index(['episodeId', 'stepNumber'], { unique: true })
export class RlEpisodeStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  episodeId: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  userId: string | null;

  @Column({ type: 'integer', name: 'step_number' })
  stepNumber: number;

  @Column({ type: 'jsonb' })
  state: Record<string, any>;

  @Column({ type: 'varchar', length: 64 })
  action: string;

  @Column({ type: 'double precision', default: 0 })
  reward: number;

  @Column({ type: 'jsonb', nullable: true, name: 'next_state' })
  nextState: Record<string, any> | null;

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
