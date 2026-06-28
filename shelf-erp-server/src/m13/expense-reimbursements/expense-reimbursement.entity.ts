import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
export type ExpenseType = 'travel' | 'entertainment' | 'office' | 'transport' | 'other';

@Entity('expense_reimbursements')
export class ExpenseReimbursement {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'expense_code', type: 'text', length: 30, unique: true })
  expenseCode: string;

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId: string;

  @Column({ name: 'applicant_name', type: 'text', length: 50 })
  applicantName: string;

  @Column({ name: 'department_id', type: 'text', length: 50, nullable: true })
  departmentId: string | null;

  @Column({ type: 'text', length: 30 })
  expenseType: ExpenseType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  attachments: string | null;

  @Column({ name: 'submit_date', type: 'text', nullable: true })
  submitDate: string | null;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: ExpenseStatus;

  @Column({ name: 'approver_id', type: 'uuid', nullable: true })
  approverId: string | null;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
