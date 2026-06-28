import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CostItem } from './cost-item.entity';
import { QuotationVersion } from './quotation-version.entity';

/** 报价单状�?*/
export type QuotationStatus = 'draft' | 'pending_review' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired';

@Entity('quotations')
export class Quotation {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'inquiry_id', type: 'uuid', nullable: true })
  inquiryId: string | null;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200, nullable: true })
  customerName: string;

  @Column({ name: 'shelf_type_id', type: 'uuid', nullable: true })
  shelfTypeId: string | null;

  @Column({ name: 'shelf_type_name', type: 'varchar', length: 100, nullable: true })
  shelfTypeName: string | null;

  @Column({ name: 'config_id', type: 'uuid', nullable: true })
  configId: string | null;

  @Column({ name: 'config_name', type: 'varchar', length: 200, nullable: true })
  configName: string | null;

  @Column({ type: 'text', default: 0 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'currency_id', type: 'uuid', nullable: true })
  currencyId: string | null;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  margin: number;

  @Column({ type: 'text', name: 'delivery_days', default: 0 })
  deliveryDays: number;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil: Date | null;

  @Column({ type: 'text', default: 1 })
  version: number;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: QuotationStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => CostItem, (item) => item.quotation)
  costItems: CostItem[];

  @OneToMany(() => QuotationVersion, (v) => v.quotation)
  versions: QuotationVersion[];
}
