import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type InvoiceType = 'sales' | 'purchase';
export type InvoiceStatus = 'draft' | 'issued' | 'received' | 'voided' | 'returned';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';

@Entity('invoices')
export class Invoice {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'invoice_code', type: 'text', length: 30 })
  invoiceCode: string;

  @Column({ name: 'invoice_no', type: 'text', length: 50, unique: true })
  invoiceNo: string;

  @Column({ name: 'invoice_type', type: 'text', length: 10 })
  invoiceType: InvoiceType;

  @Column({ name: 'related_id', type: 'uuid', nullable: true })
  relatedId: string | null;

  @Column({ name: 'related_type', type: 'text', length: 30, nullable: true })
  relatedType: string | null;

  @Column({ name: 'issue_date', type: 'text' })
  issueDate: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'supplier_buyer', type: 'text', length: 200, nullable: true })
  supplierBuyer: string | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: InvoiceStatus;

  @Column({ name: 'verification_status', type: 'text', length: 20, default: 'unverified' })
  verificationStatus: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
