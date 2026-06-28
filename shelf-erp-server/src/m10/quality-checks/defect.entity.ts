import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('defects')
export class Defect {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @Column({ name: 'process_step_id', type: 'uuid', nullable: true })
  processStepId: string;

  @Column({ name: 'quality_check_id', type: 'uuid', nullable: true })
  qualityCheckId: string;

  @Column({ type: 'text', length: 50 })
  type: string; // surface | dimension | welding | material | other

  @Column({ type: 'text', length: 20 })
  severity: string; // minor | major | critical

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'reported_at', type: 'text' })
  reportedAt: Date;

  @Column({ type: 'text', name: 'reporter_name', length: 50 })
  reporterName: string;

  @Column({ type: 'text', length: 20, default: 'open' })
  status: string; // open | resolved

  @Column({ type: 'boolean', default: false })
  resolved: boolean;

  @Column({ name: 'resolved_at', type: 'text', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string;
}
