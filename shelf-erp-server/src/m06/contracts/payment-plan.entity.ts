import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from './contract.entity';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

@Entity('payment_plans')
export class PaymentPlan {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @Column({ type: 'text', length: 100 })
  stage: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  ratio: number;

  @Column({ name: 'planned_date', type: 'date', nullable: true })
  plannedDate: Date | null;

  @Column({ name: 'actual_date', type: 'date', nullable: true })
  actualDate: Date | null;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: PaymentStatus;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @ManyToOne(() => Contract, (c) => c.paymentPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}
