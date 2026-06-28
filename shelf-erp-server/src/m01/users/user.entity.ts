import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Organization } from '../organizations/organization.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  username: string;

  @Column({ type: 'text', length: 200 })
  password: string; // bcrypt hash

  @Column({ type: 'text', length: 50 })
  name: string;

  @Column({ type: 'text', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'text', length: 100, nullable: true })
  email: string;

  @Column({ name: 'org_id', type: 'uuid', nullable: true })
  orgId: string | null;

  @Column({ type: 'text', length: 500, nullable: true })
  avatar: string;

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

  // Relations
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;
}
