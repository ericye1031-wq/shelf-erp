import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Milestone } from './milestone.entity';
import { Alert } from './alert.entity';

export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

@Entity('projects')
export class Project {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'text', name: 'customer_name', length: 200, nullable: true })
  customerName: string;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  @Column({ type: 'text', name: 'manager_name', length: 50, nullable: true })
  managerName: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'text', default: 0 })
  progress: number;

  @Column({ type: 'text', length: 20, default: 'planning' })
  status: ProjectStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => Milestone, (m) => m.project)
  milestones: Milestone[];

  @OneToMany(() => Alert, (a) => a.project)
  alerts: Alert[];
}
