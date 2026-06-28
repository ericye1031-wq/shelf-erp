import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Voucher } from './voucher.entity';

@Entity('voucher_entries')
export class VoucherEntry {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ type: 'text', length: 200, nullable: true })
  summary: string;

  @Column({ name: 'debit_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  debitAmount: number;

  @Column({ name: 'credit_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  creditAmount: number;

  @Column({ name: 'aux_data', type: 'text', nullable: true })
  auxData: string | null;

  @Column({ type: 'text', name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Voucher, (v) => v.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;
}
