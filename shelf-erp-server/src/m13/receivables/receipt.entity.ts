import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccountsReceivable } from './receivable.entity';

export type ReceiptStatus = 'confirmed' | 'cancelled';

@Entity('receipts')
export class Receipt {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'receivable_id', type: 'uuid' })
  receivableId: string;

  @Column({ type: 'text', name: 'receipt_no', length: 30, unique: true })
  receiptNo: string;

  @Column({ name: 'receipt_date', type: 'date' })
  receiptDate: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'text', length: 20, default: 'confirmed' })
  status: ReceiptStatus;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @ManyToOne(() => AccountsReceivable, (r) => r.receipts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receivable_id' })
  receivable: AccountsReceivable;
}
