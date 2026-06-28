import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Receipt } from './receipt.entity';

export type ReceivableStatus = 'pending' | 'partial' | 'settled' | 'written_off';

@Entity('accounts_receivable')
export class AccountsReceivable {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', name: 'receivable_no', length: 30, unique: true })
  receivableNo: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200 })
  customerName: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ type: 'text', name: 'contract_no', length: 50, nullable: true })
  contractNo: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'settled_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  settledAmount: number;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: ReceivableStatus;

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

  @OneToMany(() => Receipt, (r) => r.receivable)
  receipts: Receipt[];

  /** 未收余额 */
  get balance(): number {
    return this.amount - this.settledAmount;
  }
}
