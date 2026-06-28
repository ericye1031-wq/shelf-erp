import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('follow_ups')
export class FollowUp {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'opportunity_id', type: 'uuid', nullable: true })
  opportunityId: string | null;

  @Column({ type: 'text', length: 20 })
  type: string; // call, visit, email, wechat, other

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', name: 'next_action', length: 200, nullable: true })
  nextAction: string;

  @Column({ name: 'next_date', type: 'date', nullable: true })
  nextDate: Date | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;
}
