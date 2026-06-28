import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ProcessStep } from './process-step.entity';

export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type WorkOrderStatus = 'pending' | 'released' | 'in_progress' | 'completed' | 'closed';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'bom_id', type: 'uuid', nullable: true })
  bomId: string | null;

  @Column({ name: 'shelf_config_id', type: 'uuid', nullable: true })
  shelfConfigId: string | null;

  @Column({ type: 'text', default: 0 })
  quantity: number;

  @Column({ type: 'text', name: 'completed_qty', default: 0 })
  completedQty: number;

  @Column({ type: 'text', length: 20, default: 'normal' })
  priority: WorkOrderPriority;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: WorkOrderStatus;

  @Column({ name: 'planned_start', type: 'date', nullable: true })
  plannedStart: Date | null;

  @Column({ name: 'planned_end', type: 'date', nullable: true })
  plannedEnd: Date | null;

  @Column({ name: 'actual_start', type: 'date', nullable: true })
  actualStart: Date | null;

  @Column({ name: 'actual_end', type: 'date', nullable: true })
  actualEnd: Date | null;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => ProcessStep, (s) => s.workOrder)
  processSteps: ProcessStep[];
}
