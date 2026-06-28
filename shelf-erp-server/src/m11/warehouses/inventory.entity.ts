import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type InventoryTxType = 'in' | 'out' | 'transfer' | 'adjust';

@Entity('inventory')
export class Inventory {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'text', name: 'part_code', length: 50, nullable: true })
  partCode: string;

  @Column({ type: 'text', name: 'part_name', length: 100 })
  partName: string;

  @Column({ type: 'text', length: 50, nullable: true })
  material: string;

  @Column({ type: 'text', length: 100, nullable: true })
  spec: string;

  @Column({ type: 'text', length: 20, nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'safety_stock', type: 'decimal', precision: 14, scale: 2, default: 0 })
  safetyStock: number;

  @Column({ type: 'text', name: 'batch_no', length: 50, nullable: true })
  batchNo: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'text', length: 20 })
  type: InventoryTxType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  quantity: number;

  @Column({ name: 'before_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  beforeQty: number;

  @Column({ name: 'after_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  afterQty: number;

  @Column({ type: 'text', name: 'reference_no', length: 50, nullable: true })
  referenceNo: string;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;
}
