import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('oee_data')
export class OeeData {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'equipment_id', type: 'uuid' })
  equipmentId: string;

  @Column({ type: 'text', name: 'equipment_name', length: 100 })
  equipmentName: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  availability: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  performance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  quality: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  oee: number;

  @Column({ name: 'planned_time', type: 'int', default: 0 })
  plannedTime: number;

  @Column({ name: 'run_time', type: 'int', default: 0 })
  runTime: number;

  @Column({ name: 'ideal_cycle', type: 'int', default: 0 })
  idealCycle: number;

  @Column({ name: 'actual_cycle', type: 'int', default: 0 })
  actualCycle: number;

  @Column({ name: 'total_output', type: 'int', default: 0 })
  totalOutput: number;

  @Column({ name: 'good_output', type: 'int', default: 0 })
  goodOutput: number;
}
