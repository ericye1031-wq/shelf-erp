import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export type EmployeeStatus = 'active' | 'resigned' | 'suspended' | 'retired';
export type Gender = 'male' | 'female';

@Entity('employees')
export class Employee {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'text', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', length: 50 })
  name: string;

  @Column({ type: 'text', length: 10 })
  gender: Gender;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ name: 'id_number', type: 'text', length: 20, nullable: true })
  idNumber: string | null;

  @Column({ type: 'text', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', length: 100, nullable: true })
  email: string | null;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: Date | null;

  @Column({ name: 'resign_date', type: 'date', nullable: true })
  resignDate: Date | null;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ name: 'department_name', type: 'text', length: 100, nullable: true })
  departmentName: string | null;

  @Column({ type: 'text', length: 100, nullable: true })
  position: string | null;

  @Column({ type: 'text', length: 20, default: 'active' })
  status: EmployeeStatus;

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
