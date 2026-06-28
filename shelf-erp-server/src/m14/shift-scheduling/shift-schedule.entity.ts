import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type ShiftType = 'day' | 'night' | 'rotating';
export type ShiftStatus = 'scheduled' | 'confirmed' | 'cancelled';

@Entity('shift_schedules')
export class ShiftSchedule {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'employee_name', type: 'text', length: 50 })
  employeeName: string;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ name: 'shift_type', type: 'text', length: 20 })
  shiftType: ShiftType;

  @Column({ name: 'schedule_date', type: 'date' })
  scheduleDate: Date;

  @Column({ name: 'start_time', type: 'text', length: 8 })
  startTime: string;

  @Column({ name: 'end_time', type: 'text', length: 8 })
  endTime: string;

  @Column({ type: 'text', length: 20, default: 'scheduled' })
  status: ShiftStatus;

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
