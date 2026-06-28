import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WorkOrder } from './work-order.entity';

export type ProcessStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

@Entity('process_steps')
export class ProcessStep {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @Column({ type: 'text', name: 'step_code', length: 20 })
  stepCode: string;

  @Column({ type: 'text', name: 'step_name', length: 50 })
  stepName: string;

  @Column({ type: 'text', default: 1 })
  sequence: number;

  @Column({ type: 'text', name: 'equipment_name', length: 50, nullable: true })
  equipmentName: string;

  @Column({ type: 'text', name: 'planned_minutes', nullable: true })
  plannedMinutes: number;

  @Column({ type: 'text', name: 'actual_minutes', nullable: true })
  actualMinutes: number;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: ProcessStepStatus;

  @Column({ type: 'text', name: 'operator_name', length: 50, nullable: true })
  operatorName: string;

  @Column({ name: 'started_at', type: 'text', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'text', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @ManyToOne(() => WorkOrder, (w) => w.processSteps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;
}
