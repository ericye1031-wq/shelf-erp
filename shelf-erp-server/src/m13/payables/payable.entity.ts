import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './payment.entity';

export type PayableStatus = 'pending' | 'partial' | 'settled' | 'written_off';

@Entity('accounts_payable')
export class AccountsPayable {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', name: 'payable_no', length: 30, unique: true })
  payableNo: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  @Column({ type: 'text', name: 'supplier_name', length: 200, nullable: true })
  supplierName: string | null;

  @Column({ type: 'text', name: 'purchase_order_no', length: 50, nullable: true })
  purchaseOrderNo: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'settled_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  settledAmount: number;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: PayableStatus;

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

  @OneToMany(() => Payment, (p) => p.payable)
  payments: Payment[];

  get balance(): number {
    return this.amount - this.settledAmount;
  }
}
