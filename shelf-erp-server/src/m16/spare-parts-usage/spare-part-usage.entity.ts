import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('m16_spare_parts_usage')
@Index(['repairId'])
@Index(['inventoryId'])
export class SparePartUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'repair_id' })
  repairId: string;

  @Column({ type: 'text', name: 'inventory_id' })
  inventoryId: string;

  @Column({ type: 'text', name: 'part_code', length: 100 })
  partCode: string;

  @Column({ type: 'text', name: 'part_name', length: 200 })
  partName: string;

  @Column({ type: 'real' })
  quantity: number;

  @Column({ type: 'real', name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'real', name: 'total_cost' })
  totalCost: number;

  @Column({ type: 'text', name: 'remark', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;
}
