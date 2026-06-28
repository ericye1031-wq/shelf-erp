import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ProcessRoute } from './process-route.entity';

@Entity('process_route_steps')
export class ProcessRouteStep {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'route_id', type: 'uuid' })
  routeId: string;

  @Column({ type: 'text', name: 'step_code', length: 20 })
  stepCode: string;

  @Column({ type: 'text', name: 'step_name', length: 50 })
  stepName: string;

  @Column({ type: 'int', default: 1 })
  sequence: number;

  @Column({ type: 'text', name: 'equipment_type', length: 50 })
  equipmentType: string;

  @Column({ type: 'text', name: 'equipment_capacity', length: 100, default: '' })
  equipmentCapacity: string;

  @Column({ name: 'standard_minutes', type: 'decimal', precision: 8, scale: 2, default: 0 })
  standardMinutes: number;

  @Column({ type: 'text', length: 50, nullable: true })
  dependency: string;

  @Column({ type: 'text', name: 'quality_key_points', nullable: true })
  qualityKeyPoints: string;

  @Column({ type: 'text', name: 'report_method', length: 50, default: '' })
  reportMethod: string;

  @Column({ type: 'text', name: 'equipment_interface', length: 50, default: '' })
  equipmentInterface: string;

  @ManyToOne(() => ProcessRoute, (r) => r.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  processRoute: ProcessRoute;
}
