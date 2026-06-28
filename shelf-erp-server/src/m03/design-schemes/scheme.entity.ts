import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SchemeVersion } from './scheme-version.entity';

export type SchemeStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';

@Entity('design_schemes')
export class Scheme {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ name: 'inquiry_id', type: 'uuid', nullable: true })
  inquiryId: string | null;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ name: 'rack_type', type: 'text', length: 100, nullable: true })
  rackType: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'current_version', type: 'text', length: 20, default: 'V1.0' })
  currentVersion: string;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: SchemeStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => SchemeVersion, (v) => v.scheme)
  versions: SchemeVersion[];
}
