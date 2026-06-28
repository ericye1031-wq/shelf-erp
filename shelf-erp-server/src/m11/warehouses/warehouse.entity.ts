import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('warehouses')
export class Warehouse {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 200, nullable: true })
  location: string;

  @Column({ type: 'text', length: 50, nullable: true })
  type: string;

  @Column({ type: 'text', name: 'manager_name', length: 50, nullable: true })
  managerName: string;

  @Column({ type: 'text', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
