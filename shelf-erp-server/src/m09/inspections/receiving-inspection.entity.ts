import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type InspectionResult = 'pass' | 'fail';
export type InspectionOverallResult = 'accepted' | 'concession' | 'returned';

@Entity('receiving_inspections')
export class ReceivingInspection {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId: string | null;

  @Column({ type: 'text', name: 'purchase_order_code', length: 50, nullable: true })
  purchaseOrderCode: string | null;

  @Column({ type: 'text', name: 'inspection_no', length: 50, unique: true })
  inspectionNo: string;

  @Column({ type: 'text', length: 100 })
  inspector: string;

  @Column({ name: 'inspection_date', type: 'date' })
  inspectionDate: Date;

  @Column({ type: 'text', length: 10 })
  appearance: InspectionResult;

  @Column({ type: 'text', length: 10 })
  dimension: InspectionResult;

  @Column({ type: 'text', name: 'material_quality', length: 10 })
  materialQuality: InspectionResult;

  @Column({ type: 'text', length: 10 })
  coating: InspectionResult;

  @Column({ type: 'text', name: 'quantity_check', length: 10 })
  quantityCheck: InspectionResult;

  @Column({ type: 'text', length: 20 })
  result: InspectionOverallResult;

  @Column({ name: 'defect_desc', type: 'text', nullable: true })
  defectDesc: string | null;

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
