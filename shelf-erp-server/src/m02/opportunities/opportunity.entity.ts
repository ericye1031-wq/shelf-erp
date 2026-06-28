import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('opportunities')
export class Opportunity {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200, nullable: true })
  customerName: string;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'text', length: 20 })
  stage: string; // initial, qualification, proposal, negotiation, closed_won, closed_lost

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  probability: number;

  @Column({ name: 'expected_date', type: 'date', nullable: true })
  expectedDate: Date | null;

  @Column({ type: 'text', nullable: true })
  description: string;

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
}
