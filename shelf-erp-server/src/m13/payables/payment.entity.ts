import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccountsPayable } from './payable.entity';

export type PaymentStatus = 'confirmed' | 'cancelled';

@Entity('payments')
export class Payment {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'payable_id', type: 'uuid' })
  payableId: string;

  @Column({ type: 'text', name: 'payment_no', length: 30, unique: true })
  paymentNo: string;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'bank_account_id', type: 'uuid', nullable: true })
  bankAccountId: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'text', length: 20, default: 'confirmed' })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @ManyToOne(() => AccountsPayable, (p) => p.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payable_id' })
  payable: AccountsPayable;
}
