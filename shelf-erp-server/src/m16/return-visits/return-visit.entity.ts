import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** 回访状态 */
export type ReturnVisitStatus =
  | 'pending'     // 待回访
  | 'completed'   // 已完成
  | 'unreachable' // 无法联系
  | 'refused';    // 拒绝回访

/** 回访方式 */
export type VisitMethod = 'phone' | 'onsite' | 'online';

@Entity('m16_return_visits')
@Index(['visitNo'], { unique: true })
@Index(['status'])
export class ReturnVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'visit_no', length: 50 })
  visitNo: string;

  @Column({ type: 'text', name: 'ticket_id', nullable: true })
  ticketId: string;

  @Column({ type: 'text', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200 })
  customerName: string;

  @Column({ type: 'text', default: 'phone' })
  visitMethod: VisitMethod;

  @Column({ type: 'int', name: 'satisfaction_score', nullable: true })
  satisfactionScore: number;

  @Column({ type: 'text', name: 'feedback', nullable: true })
  feedback: string;

  @Column({ type: 'text', default: 'pending' })
  status: ReturnVisitStatus;

  @Column({ type: 'text', name: 'visited_by', nullable: true })
  visitedBy: string;

  @Column({ type: 'text', name: 'visited_by_name', length: 100, nullable: true })
  visitedByName: string;

  @Column({ type: 'text', name: 'visited_at', nullable: true })
  visitedAt: string;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
