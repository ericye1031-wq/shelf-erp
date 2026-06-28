import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('organizations')
export class Organization {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 100 })
  name: string;

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'text', length: 20 })
  type: string; // group, company, factory, department

  @Column({ type: 'text', length: 50, nullable: true })
  contact: string;

  @Column({ type: 'text', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'text', length: 200, nullable: true })
  address: string;

  @Column({ type: 'text', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', default: 0 })
  sort: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];
}
