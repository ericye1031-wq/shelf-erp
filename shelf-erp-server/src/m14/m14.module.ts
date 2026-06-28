import { Module } from '@nestjs/common';
import { EmployeeModule } from './employees/employee.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SalaryModule } from './salary/salary.module';
import { TrainingModule } from './training/training.module';
import { PerformanceModule } from './performance/performance.module';
import { ShiftScheduleModule } from './shift-scheduling/shift-schedule.module';

@Module({
  imports: [
    EmployeeModule,
    AttendanceModule,
    SalaryModule,
    TrainingModule,
    PerformanceModule,
    ShiftScheduleModule,
  ],
  exports: [
    EmployeeModule,
    AttendanceModule,
    SalaryModule,
    TrainingModule,
    PerformanceModule,
    ShiftScheduleModule,
  ],
})
export class M14Module {}
