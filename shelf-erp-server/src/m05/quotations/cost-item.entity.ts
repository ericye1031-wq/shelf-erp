import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quotation } from './quotation.entity';

/** 成本项分类 */
export type CostCategory = 'material' | 'labor' | 'overhead' | 'outsourcing' | 'logistics' | 'other';

@Entity('cost_items')
export class CostItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'quotation_id', type: 'uuid' })
  quotationId: string;

  @Column({ type: 'text', length: 20 })
  category: CostCategory;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'text', length: 20, nullable: true })
  unit: string;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @Column({ type: 'text', name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Quotation, (q) => q.costItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;
}
