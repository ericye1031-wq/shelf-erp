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

export type InvoiceType = 'normal' | 'special';
export type InvoiceStatus = 'pending' | 'issued' | 'cancelled';

@Entity('invoices')
export class Invoice {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 20 })
  type: InvoiceType;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate: Date | null;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: InvoiceStatus;

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

  @ManyToOne(() => Contract, (c) => c.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}
