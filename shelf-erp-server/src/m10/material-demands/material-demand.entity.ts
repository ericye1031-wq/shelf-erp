import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('material_demands')
export class MaterialDemand {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @Column({ name: 'bom_item_id', type: 'uuid', nullable: true })
  bomItemId: string;

  @Column({ type: 'text', length: 100 })
  material: string;

  @Column({ type: 'text', length: 200, nullable: true })
  spec: string;

  @Column({ name: 'required_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  requiredQty: number;

  @Column({ name: 'available_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  availableQty: number;

  @Column({ name: 'shortage_qty', type: 'decimal', precision: 14, scale: 2, default: 0 })
  shortageQty: number;

  @Column({ type: 'text', length: 20, default: '个' })
  unit: string;

  @Column({ name: 'planned_date', type: 'date', nullable: true })
  plannedDate: Date | null;

  @Column({ type: 'text', length: 20, default: 'pending' })
  status: string; // pending | satisfied | short
}
