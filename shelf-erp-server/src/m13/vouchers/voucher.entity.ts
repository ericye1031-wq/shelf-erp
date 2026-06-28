import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VoucherEntry } from './voucher-entry.entity';

export type VoucherStatus = 'draft' | 'submitted' | 'audited' | 'posted' | 'cancelled';

@Entity('vouchers')
export class Voucher {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', name: 'voucher_no', length: 30, unique: true })
  voucherNo: string;

  @Column({ name: 'voucher_date', type: 'date' })
  voucherDate: Date;

  @Column({ type: 'text', name: 'attachment_count', default: 0 })
  attachmentCount: number;

  @Column({ name: 'total_debit', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ name: 'total_credit', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCredit: number;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: VoucherStatus;

  @Column({ name: 'posted_by', type: 'uuid', nullable: true })
  postedBy: string | null;

  @Column({ name: 'posted_at', type: 'text', nullable: true })
  postedAt: Date | null;

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

  @OneToMany(() => VoucherEntry, (e) => e.voucher, { cascade: true })
  entries: VoucherEntry[];
}
