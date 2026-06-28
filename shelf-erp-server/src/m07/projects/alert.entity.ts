import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Project } from './project.entity';

export type AlertType = 'deadline' | 'cost' | 'quality' | 'resource' | 'custom';
export type AlertLevel = 'info' | 'warning' | 'critical';

@Entity('alerts')
export class Alert {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ type: 'text', length: 20 })
  type: AlertType;

  @Column({ type: 'text', length: 20 })
  level: AlertLevel;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'triggered_at', type: 'text' })
  triggeredAt: Date;

  @Column({ name: 'resolved_at', type: 'text', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => Project, (p) => p.alerts)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
