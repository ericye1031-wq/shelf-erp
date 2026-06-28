import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('ai_schedule_results')
export class AiScheduleResult {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ name: 'optimized_at', type: 'datetime' })
  optimizedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  makespan: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'equipment_utilization', default: 0 })
  equipmentUtilization: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'changeover_time', default: 0 })
  changeoverTime: number;

  @Column({ type: 'simple-json', nullable: true })
  schedule: Record<string, any> | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
