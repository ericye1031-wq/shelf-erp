import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from './customer.entity';

@Entity('contacts')
export class Contact {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'text', length: 50 })
  name: string;

  @Column({ type: 'text', length: 50, nullable: true })
  position: string;

  @Column({ type: 'text', length: 30, nullable: true })
  phone: string;

  @Column({ type: 'text', length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'text', length: 200, nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at', })
  updatedAt: Date;

  @ManyToOne(() => Customer, (c) => c.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
