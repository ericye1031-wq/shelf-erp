import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('inquiries')
export class Inquiry {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200, nullable: true })
  customerName: string;

  @Column({ name: 'opportunity_id', type: 'uuid', nullable: true })
  opportunityId: string | null;

  @Column({ type: 'text', name: 'shelf_type', length: 100, nullable: true })
  shelfType: string;

  @Column({ type: 'text', nullable: true })
  requirement: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'text', length: 20, nullable: true })
  unit: string;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
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
