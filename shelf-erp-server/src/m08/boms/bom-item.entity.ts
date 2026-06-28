import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BOM } from './bom.entity';

@Entity('bom_items')
export class BomItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'bom_id', type: 'uuid' })
  bomId: string;

  @Column({ type: 'text', name: 'part_code', length: 100 })
  partCode: string;

  @Column({ type: 'text', name: 'part_name', length: 200 })
  partName: string;

  @Column({ type: 'text', length: 100, nullable: true })
  material: string;

  @Column({ type: 'text', length: 200, nullable: true })
  spec: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'text', length: 20, default: '个' })
  unit: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  length: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  weight: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'waste_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  wasteRate: number;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ name: 'alternative_ids', type: 'json', nullable: true })
  alternativeIds: string[];

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => BOM, (b) => b.items)
  @JoinColumn({ name: 'bom_id' })
  bom: BOM;
}
