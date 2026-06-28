import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type PaymentRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

@Entity('payment_requests')
export class PaymentRequest {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'payable_id', type: 'uuid' })
  payableId: string;

  @Column({ type: 'text', name: 'request_no', length: 30, unique: true })
  requestNo: string;

  @Column({ name: 'bank_account_id', type: 'uuid', nullable: true })
  bankAccountId: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'request_date', type: 'date' })
  requestDate: Date;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: PaymentRequestStatus;

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
