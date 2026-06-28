import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PaymentPlan } from './payment-plan.entity';
import { Invoice } from './invoice.entity';

export type ContractStatus = 'draft' | 'reviewing' | 'approved' | 'executing' | 'completed' | 'terminated';

@Entity('contracts')
export class Contract {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'quotation_id', type: 'uuid', nullable: true })
  quotationId: string | null;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200, nullable: true })
  customerName: string;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'currency_id', type: 'uuid', nullable: true })
  currencyId: string | null;

  @Column({ name: 'sign_date', type: 'date', nullable: true })
  signDate: Date | null;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date | null;

  @Column({ type: 'text', name: 'payment_terms', length: 100, nullable: true })
  paymentTerms: string;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: ContractStatus;

  @Column({ type: 'text', nullable: true })
  terms: string;

  /** 关联项目ID（合同审批通过后自动创建项目） */
  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId?: string;

  /** 已回款金额（冗余字段，从回款计划汇总） */
  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  /** 已开发票金额（冗余字段，从发票汇总） */
  @Column({ name: 'invoice_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  invoiceAmount: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => PaymentPlan, (p) => p.contract)
  paymentPlans: PaymentPlan[];

  @OneToMany(() => Invoice, (i) => i.contract)
  invoices: Invoice[];
}
