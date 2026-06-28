import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type PerformanceStatus = 'draft' | 'submitted' | 'reviewed' | 'confirmed';
export type PerformancePeriod = 'monthly' | 'quarterly' | 'annual';

@Entity('performance_reviews')
export class PerformanceReview {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'employee_name', type: 'text', length: 50 })
  employeeName: string;

  @Column({ name: 'review_period', type: 'text', length: 10 })
  reviewPeriod: PerformancePeriod;

  @Column({ name: 'period_label', type: 'text', length: 20 })
  periodLabel: string;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string | null;

  @Column({ name: 'reviewer_name', type: 'text', length: 50, nullable: true })
  reviewerName: string | null;

  @Column({ name: 'kpi_score', type: 'real', nullable: true })
  kpiScore: number | null;

  @Column({ name: 'attitude_score', type: 'real', nullable: true })
  attitudeScore: number | null;

  @Column({ name: 'skill_score', type: 'real', nullable: true })
  skillScore: number | null;

  @Column({ name: 'total_score', type: 'real', nullable: true })
  totalScore: number | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: PerformanceStatus;

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
