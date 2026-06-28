import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('install_costs')
export class InstallCost {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ name: 'labor_fee', type: 'decimal', precision: 14, scale: 2, default: 0 })
  laborFee: number;

  @Column({ name: 'travel_fee', type: 'decimal', precision: 14, scale: 2, default: 0 })
  travelFee: number;

  @Column({ name: 'accommodation_fee', type: 'decimal', precision: 14, scale: 2, default: 0 })
  accommodationFee: number;

  @Column({ name: 'tool_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  toolCost: number;

  @Column({ name: 'material_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  materialCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
