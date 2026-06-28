import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from './contact.entity';

@Entity('customers')
export class Customer {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 200 })
  name: string;

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', name: 'short_name', length: 50, nullable: true })
  shortName: string;

  @Column({ type: 'text', length: 20 })
  type: string; // direct, agent, distributor

  @Column({ type: 'text', length: 50, nullable: true })
  industry: string;

  @Column({ type: 'text', length: 50, nullable: true })
  region: string;

  @Column({ type: 'text', length: 1 })
  level: string; // A, B, C, D

  @Column({ type: 'text', length: 50, nullable: true })
  source: string;

  @Column({ type: 'text', length: 20, default: 'active' })
  status: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @OneToMany(() => Contact, (c) => c.customer)
  contacts: Contact[];
}
