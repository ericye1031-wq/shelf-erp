import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type CostDimensionType = 'material' | 'labor' | 'overhead' | 'outsourcing' | 'logistics' | 'other';

@Entity('cost_dimensions')
export class CostDimension {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'quotation_id', type: 'uuid', nullable: true })
  quotationId: string | null;

  @Column({ type: 'text', length: 20 })
  type: CostDimensionType;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ name: 'budget_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  budgetAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ name: 'variance_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  varianceAmount: number;

  @Column({ name: 'variance_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  varianceRate: number;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
