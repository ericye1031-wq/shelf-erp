import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/** 参数定义 */
export interface ParameterDef {
  key: string;
  label: string;
  type: 'string' | 'number' | 'select';
  unit?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string | number;
  min?: number;
  max?: number;
}

@Entity('shelf_types')
export class ShelfType {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 50, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parameter_template', type: 'json', nullable: true })
  parameterTemplate: ParameterDef[];

  @Column({ type: 'text', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;
}
