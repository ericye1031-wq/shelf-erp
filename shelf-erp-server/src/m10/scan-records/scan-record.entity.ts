import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('scan_records')
export class ScanRecord {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @Column({ name: 'process_step_id', type: 'uuid' })
  processStepId: string;

  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  operatorId: string;

  @Column({ type: 'text', name: 'operator_name', length: 50 })
  operatorName: string;

  @Column({ type: 'text', length: 20 })
  type: string; // start | complete | defect | material

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'defect_qty', type: 'int', default: 0 })
  defectQty: number;

  @Column({ name: 'scanned_at', type: 'text' })
  scannedAt: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
