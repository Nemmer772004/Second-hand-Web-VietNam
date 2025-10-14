import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_user_mapping')
export class UserMapping {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  uuid!: string;

  @Column({ type: 'integer', unique: true })
  numericId!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
