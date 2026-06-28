import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('equipment')
export class Equipment {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 50 })
  type: string;

  @Column({ type: 'text', length: 50, nullable: true })
  workshop: string;

  @Column({ type: 'text', length: 20, default: 'idle' })
  status: string; // idle | running | maintenance | fault

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ name: 'current_load', type: 'int', default: 0 })
  currentLoad: number;

  @Column({ name: 'next_maintenance', type: 'date', nullable: true })
  nextMaintenance: Date | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
