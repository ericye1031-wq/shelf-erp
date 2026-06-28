import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type CostAlertLevel = 'info' | 'warning' | 'critical';

@Entity('cost_alerts')
export class CostAlert {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'cost_dimension_id', type: 'uuid', nullable: true })
  costDimensionId: string | null;

  @Column({ type: 'text', length: 20 })
  level: CostAlertLevel;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'threshold_value', type: 'decimal', precision: 14, scale: 2, default: 0 })
  thresholdValue: number;

  @Column({ name: 'actual_value', type: 'decimal', precision: 14, scale: 2, default: 0 })
  actualValue: number;

  @Column({ type: 'text', name: 'is_read', default: false })
  isRead: boolean;

  @Column({ type: 'text', name: 'is_resolved', default: false })
  isResolved: boolean;

  @Column({ name: 'triggered_at', type: 'text' })
  triggeredAt: Date;

  @Column({ name: 'resolved_at', type: 'text', nullable: true })
  resolvedAt: Date | null;
}
