import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ProcessRouteStep } from './process-route-step.entity';

@Entity('process_routes')
export class ProcessRoute {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', name: 'route_code', length: 30, unique: true })
  routeCode: string;

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ name: 'shelf_type_id', type: 'uuid' })
  shelfTypeId: string;

  @Column({ type: 'text', name: 'product_part', length: 50, default: '' })
  productPart: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'std_total_hours', type: 'decimal', precision: 8, scale: 2, default: 0 })
  stdTotalHours: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => ProcessRouteStep, (s) => s.processRoute, { cascade: true })
  steps: ProcessRouteStep[];
}
