import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_recommendations')
export class AIRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('text', { array: true })
  recommendedProductIds: string[];

  @Column({ type: 'jsonb' })
  context: Record<string, any>;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'float' })
  confidence: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
