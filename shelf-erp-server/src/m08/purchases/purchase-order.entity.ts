import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseItem } from './purchase-item.entity';

export type PurchaseStatus = 'draft' | 'submitted' | 'approved' | 'ordered' | 'partial_received' | 'received' | 'cancelled';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  @Column({ type: 'text', name: 'supplier_name', length: 200, nullable: true })
  supplierName: string;

  @Column({ type: 'text', name: 'contact_name', length: 50, nullable: true })
  contactName: string;

  @Column({ type: 'text', name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string;

  @Column({ name: 'order_date', type: 'date', nullable: true })
  orderDate: Date | null;

  @Column({ name: 'expected_date', type: 'date', nullable: true })
  expectedDate: Date | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: PurchaseStatus;

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

  @OneToMany(() => PurchaseItem, (i) => i.purchaseOrder)
  items: PurchaseItem[];
}
