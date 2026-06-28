import type { AuditFields } from './common';

/** 员工状态 */
export type EmployeeStatus = 'active' | 'resigned' | 'suspended' | 'retired';
export type Gender = 'male' | 'female';

/** 员工 */
export interface Employee extends AuditFields {
  id: string;
  code: string;
  name: string;
  gender: Gender;
  birthDate: string | null;
  idNumber: string | null;
  phone: string | null;
  email: string | null;
  hireDate: string | null;
  resignDate: string | null;
  departmentId: string | null;
  departmentName: string | null;
  position: string | null;
  status: EmployeeStatus;
  remark: string | null;
}

/** 考勤状态 */
export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'overtime';

/** 考勤记录 */
export interface AttendanceRecord extends AuditFields {
  id: string;
  employeeId: string;
  employeeName: string;
  recordDate: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  leaveType: string | null;
  overtimeHours: number | null;
  remark: string | null;
}

/** 薪资状态 */
export type SalaryStatus = 'draft' | 'submitted' | 'approved' | 'paid';

/** 薪资记录 */
export interface SalaryRecord extends AuditFields {
  id: string;
  employeeId: string;
  employeeName: string;
  salaryMonth: string;
  baseSalary: number;
  overtimePay: number;
  bonus: number;
  allowance: number;
  deduction: number;
  socialInsurance: number;
  housingFund: number;
  actualAmount: number;
  status: SalaryStatus;
  paidDate: string | null;
  remark: string | null;
}

/** 培训状态 */
export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

/** 培训记录 */
export interface TrainingRecord extends AuditFields {
  id: string;
  code: string;
  title: string;
  trainer: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  trainingType: string;
  cost: number;
  participantCount: number;
  status: TrainingStatus;
  remark: string | null;
}

/** 绩效状态 */
export type PerformanceStatus = 'draft' | 'submitted' | 'reviewed' | 'confirmed';
export type PerformancePeriod = 'monthly' | 'quarterly' | 'annual';

/** 绩效评估 */
export interface PerformanceReview extends AuditFields {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: PerformancePeriod;
  periodLabel: string;
  reviewerId: string | null;
  reviewerName: string | null;
  kpiScore: number | null;
  attitudeScore: number | null;
  skillScore: number | null;
  totalScore: number | null;
  status: PerformanceStatus;
  remark: string | null;
}
