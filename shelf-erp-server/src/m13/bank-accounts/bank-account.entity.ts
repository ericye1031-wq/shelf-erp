import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type AccountType = 'cash' | 'bank' | 'other';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50 })
  name: string;

  @Column({ type: 'text', name: 'account_no', length: 50 })
  accountNo: string;

  @Column({ type: 'text', name: 'bank_name', length: 100 })
  bankName: string;

  @Column({ type: 'text', name: 'branch_name', length: 100, nullable: true })
  branchName: string | null;

  @Column({ type: 'text', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'text', length: 10, default: 'bank' })
  accountType: AccountType;

  @Column({ type: 'text', default: true })
  active: boolean;

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
