import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type RequisitionUrgency = 'normal' | 'urgent';
export type RequisitionStatus = 'draft' | 'submitted' | 'approved' | 'converted' | 'cancelled';

@Entity('purchase_requisitions')
export class PurchaseRequisition {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ type: 'text', name: 'material_code', length: 50 })
  materialCode: string;

  @Column({ type: 'text', name: 'material_name', length: 200 })
  materialName: string;

  @Column({ type: 'text', nullable: true })
  spec: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'text', length: 20, default: '个' })
  unit: string;

  @Column({ name: 'demand_date', type: 'date', nullable: true })
  demandDate: Date | null;

  @Column({ name: 'suggested_supplier_id', type: 'uuid', nullable: true })
  suggestedSupplierId: string | null;

  @Column({ type: 'text', length: 10, default: 'normal' })
  urgency: RequisitionUrgency;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: RequisitionStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'approved_at', type: 'text', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
