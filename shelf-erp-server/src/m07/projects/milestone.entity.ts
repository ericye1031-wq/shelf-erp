import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Project } from './project.entity';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

@Entity('milestones')
export class Milestone {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ name: 'planned_date', type: 'date', nullable: true })
  plannedDate: Date | null;

  @Column({ name: 'actual_date', type: 'date', nullable: true })
  actualDate: Date | null;

  @Column({ type: 'text', default: 0 })
  progress: number;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: MilestoneStatus;

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

  @ManyToOne(() => Project, (p) => p.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
