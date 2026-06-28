import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type SalaryStatus = 'draft' | 'submitted' | 'approved' | 'paid';

@Entity('salary_records')
export class SalaryRecord {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'employee_name', type: 'text', length: 50 })
  employeeName: string;

  @Column({ name: 'salary_month', type: 'text', length: 7 })
  salaryMonth: string;

  @Column({ name: 'base_salary', type: 'real' })
  baseSalary: number;

  @Column({ name: 'overtime_pay', type: 'real', default: 0 })
  overtimePay: number;

  @Column({ name: 'bonus', type: 'real', default: 0 })
  bonus: number;

  @Column({ name: 'allowance', type: 'real', default: 0 })
  allowance: number;

  @Column({ name: 'deduction', type: 'real', default: 0 })
  deduction: number;

  @Column({ name: 'social_insurance', type: 'real', default: 0 })
  socialInsurance: number;

  @Column({ name: 'housing_fund', type: 'real', default: 0 })
  housingFund: number;

  @Column({ name: 'actual_amount', type: 'real' })
  actualAmount: number;

  @Column({ type: 'text', length: 20, default: 'draft' })
  status: SalaryStatus;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate: Date | null;

  @Column({ type: 'text', length: 200, nullable: true })
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
