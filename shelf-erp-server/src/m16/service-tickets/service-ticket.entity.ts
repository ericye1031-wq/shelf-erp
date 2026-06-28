import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** 服务工单状态 */
export type ServiceTicketStatus =
  | 'pending'     // 待处理
  | 'assigned'    // 已分配
  | 'processing'  // 处理中
  | 'resolved'    // 已解决
  | 'closed'      // 已关闭
  | 'cancelled';  // 已取消

/** 服务类型 */
export type ServiceType = 'repair' | 'maintain' | 'install' | 'consult' | 'other';

@Entity('m16_service_tickets')
@Index(['ticketNo'], { unique: true })
@Index(['status'])
export class ServiceTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'ticket_no', length: 50 })
  ticketNo: string;

  @Column({ type: 'text', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', default: 'repair' })
  serviceType: ServiceType;

  @Column({ type: 'text', default: 'medium' })
  priority: string;

  @Column({ type: 'text', default: 'pending' })
  status: ServiceTicketStatus;

  @Column({ type: 'text', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'text', name: 'customer_name', length: 200 })
  customerName: string;

  @Column({ type: 'text', name: 'project_id', nullable: true })
  projectId: string;

  @Column({ type: 'text', name: 'project_name', length: 200, nullable: true })
  projectName: string;

  @Column({ type: 'text', name: 'contact_phone', length: 50, nullable: true })
  contactPhone: string;

  @Column({ type: 'text', name: 'assigned_to', nullable: true })
  assignedTo: string;

  @Column({ type: 'text', name: 'assigned_to_name', length: 100, nullable: true })
  assignedToName: string;

  @Column({ type: 'text', name: 'solution', nullable: true })
  solution: string;

  @Column({ type: 'text', name: 'region', nullable: true })
  region: string;

  @Column({ type: 'text', name: 'assigned_at', nullable: true })
  assignedAt: Date;

  @Column({ type: 'text', name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'int', name: 'satisfaction_score', nullable: true })
  satisfactionScore: number;

  @Column({ type: 'text', name: 'satisfaction_comment', nullable: true })
  satisfactionComment: string;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
