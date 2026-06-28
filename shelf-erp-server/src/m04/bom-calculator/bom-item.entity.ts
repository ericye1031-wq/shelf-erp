import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/** BOM项 */
@Entity('bom_items')
export class BomItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'bom_id', type: 'uuid' })
  bomId: string;

  @Column({ type: 'text', name: 'part_code', length: 50 })
  partCode: string;

  @Column({ type: 'text', name: 'part_name', length: 100 })
  partName: string;

  @Column({ type: 'text', length: 50, nullable: true })
  material: string;

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  length: number;

  @Column({ type: 'text', length: 20, nullable: true })
  unit: string;

  @Column({ name: 'unit_weight', type: 'decimal', precision: 14, scale: 4, nullable: true })
  unitWeight: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 14, scale: 2, nullable: true })
  unitCost: number;

  @Column({ name: 'waste_rate', type: 'decimal', precision: 5, scale: 4, default: 0 })
  wasteRate: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'text', name: 'category', length: 20, nullable: true })
  category: string;

  @Column({ type: 'text', name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;
}
