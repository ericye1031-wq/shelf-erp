import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

@Entity('training_records')
export class TrainingRecord {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ name: 'trainer', type: 'text', length: 50, nullable: true })
  trainer: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'text', length: 200, nullable: true })
  location: string | null;

  @Column({ name: 'training_type', type: 'text', length: 30 })
  trainingType: string;

  @Column({ type: 'real', default: 0 })
  cost: number;

  @Column({ name: 'participant_count', type: 'integer', default: 0 })
  participantCount: number;

  @Column({ type: 'text', length: 20, default: 'planned' })
  status: TrainingStatus;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
