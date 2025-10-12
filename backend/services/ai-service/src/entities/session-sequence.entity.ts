import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_session_sequences')
@Index(['userId'])
@Index(['sessionId'], { unique: true })
export class SessionSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 64 })
  sessionId: string;

  @Column({ type: 'timestamp with time zone' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  length: number;

  @Column({ type: 'varchar', array: true, default: '{}' })
  actionSequence: string[];

  @Column({ type: 'varchar', array: true, default: '{}' })
  productSequence: string[];

  @Column({ type: 'double precision', array: true, default: '{}' })
  timeSequence: number[];

  @Column({ type: 'double precision', array: true, default: '{}' })
  rewardSequence: number[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
