import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @Column({ type: 'text', name: 'part_code', length: 50, nullable: true })
  partCode: string;

  @Column({ type: 'text', name: 'part_name', length: 100 })
  partName: string;

  @Column({ type: 'text', length: 50, nullable: true })
  material: string;

  @Column({ type: 'text', length: 100, nullable: true })
  spec: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'text', length: 20, nullable: true })
  unit: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'received_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  receivedQty: number;

  @Column({ name: 'expected_date', type: 'date', nullable: true })
  expectedDate: Date | null;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @Column({ type: 'text', name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => PurchaseOrder, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;
}
