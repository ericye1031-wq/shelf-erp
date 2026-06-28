import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BankAccount } from './bank-account.entity';

export type TransactionDirection = 'in' | 'out';

@Entity('bank_transactions')
export class BankTransaction {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'bank_account_id', type: 'uuid' })
  bankAccountId: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ type: 'text', length: 200 })
  description: string;

  @Column({ type: 'text', length: 10 })
  direction: TransactionDirection;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 14, scale: 2, default: 0 })
  balanceAfter: number;

  @Column({ type: 'text', name: 'reference_no', length: 100, nullable: true })
  referenceNo: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @ManyToOne(() => BankAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;
}
