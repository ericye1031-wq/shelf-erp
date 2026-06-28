import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('alternative_materials')
export class AlternativeMaterial {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'original_item_id', type: 'uuid' })
  originalItemId: string;

  @Column({ type: 'text', name: 'part_code', length: 100 })
  partCode: string;

  @Column({ type: 'text', name: 'part_name', length: 200 })
  partName: string;

  @Column({ type: 'text', length: 100, nullable: true })
  material: string;

  @Column({ type: 'text', length: 200, nullable: true })
  spec: string;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ name: 'price_diff', type: 'decimal', precision: 14, scale: 2, default: 0 })
  priceDiff: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @Column({ type: 'text', nullable: true })
  remark: string;
}
