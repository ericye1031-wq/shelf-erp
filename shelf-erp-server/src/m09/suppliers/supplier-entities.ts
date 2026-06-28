import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/** 供应商价格库 (SRS §8.1) */
@Entity('supplier_prices')
export class SupplierPrice {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ type: 'text', length: 50 })
  materialCode: string;

  @Column({ type: 'text', length: 100 })
  materialName: string;

  @Column({ type: 'text', length: 50, nullable: true })
  spec: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  unitPrice: number;

  @Column({ type: 'text', length: 10 })
  unit: string;

  @Column({ type: 'text', length: 5, default: 'CNY' })
  currency: string;

  @Column({ name: 'min_order_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  minOrderQty: number;

  @Column({ name: 'standard_days', type: 'int', default: 7 })
  standardDays: number;

  @Column({ name: 'urgent_days', type: 'int', default: 3 })
  urgentDays: number;

  @Column({ name: 'valid_from', type: 'date' })
  validFrom: string;

  @Column({ name: 'valid_to', type: 'date', nullable: true })
  validTo: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

/** 询比价记录 (SRS §8.2) */
@Entity('supplier_quotes')
export class SupplierQuote {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'requisition_id', type: 'uuid' })
  requisitionId: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ type: 'text', length: 100 })
  supplierName: string;

  @Column({ type: 'text', length: 50 })
  materialCode: string;

  @Column({ type: 'text', length: 100 })
  materialName: string;

  @Column({ type: 'text', length: 50, nullable: true })
  spec: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'text', length: 5, default: 'CNY' })
  currency: string;

  @Column({ name: 'delivery_days', type: 'int', default: 7 })
  deliveryDays: number;

  @Column({ type: 'text', length: 10, default: 'pending' })
  status: string;

  @Column({ name: 'submitted_at', type: 'text' })
  submittedAt: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;
}

/** 供应商评级快照 (SRS §8.1) */
@Entity('supplier_ratings')
export class SupplierRatingRecord {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ type: 'text', length: 10 })
  period: string;

  @Column({ name: 'delivery_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  deliveryRate: number;

  @Column({ name: 'quality_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityRate: number;

  @Column({ name: 'price_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  priceScore: number;

  @Column({ name: 'service_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  serviceScore: number;

  @Column({ name: 'total_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalScore: number;

  @Column({ type: 'text', length: 1 })
  rating: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
