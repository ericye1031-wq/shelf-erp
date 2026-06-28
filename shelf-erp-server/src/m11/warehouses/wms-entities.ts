import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('storage_locations')
export class StorageLocation {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'text', name: 'loc_code', length: 30, unique: true })
  locCode: string;

  @Column({ type: 'text', name: 'zone', length: 10 })
  zone: string;

  @Column({ type: 'text', length: 10, nullable: true })
  aisle: string;

  @Column({ type: 'text', length: 10, nullable: true })
  row: string;

  @Column({ type: 'text', length: 10, nullable: true })
  tier: string;

  @Column({ type: 'text', length: 10, nullable: true })
  position: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  maxCapacity: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  currentLoad: number;

  @Column({ type: 'text', length: 20, default: 'available' })
  status: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('stock_counts')
export class StockCount {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'text', name: 'count_code', length: 30, unique: true })
  countCode: string;

  @Column({ type: 'text', length: 50 })
  type: string;

  @Column({ type: 'text', name: 'count_date', length: 10 })
  countDate: string;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('stock_count_items')
export class StockCountItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'count_id', type: 'uuid' })
  countId: string;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @Column({ name: 'loc_code', type: 'text', length: 30, nullable: true })
  locCode: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  bookQty: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  actualQty: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  diffQty: number;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
