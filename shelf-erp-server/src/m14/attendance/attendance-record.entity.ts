import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'overtime';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'employee_name', type: 'text', length: 50 })
  employeeName: string;

  @Column({ name: 'record_date', type: 'date' })
  recordDate: Date;

  @Column({ name: 'clock_in', type: 'text', nullable: true })
  clockIn: string | null;

  @Column({ name: 'clock_out', type: 'text', nullable: true })
  clockOut: string | null;

  @Column({ type: 'text', length: 20 })
  status: AttendanceStatus;

  @Column({ name: 'leave_type', type: 'text', length: 30, nullable: true })
  leaveType: string | null;

  @Column({ name: 'overtime_hours', type: 'real', nullable: true })
  overtimeHours: number | null;

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
