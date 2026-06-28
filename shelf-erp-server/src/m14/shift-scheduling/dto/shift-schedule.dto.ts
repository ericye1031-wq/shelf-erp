import { IsString, IsOptional, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftType } from '../shift-schedule.entity';

export class CreateShiftScheduleDto {
  @ApiProperty({ description: '员工ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: '员工姓名' })
  @IsString()
  @MaxLength(50)
  employeeName: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: '班次类型', enum: ['day', 'night', 'rotating'] })
  @IsEnum(['day', 'night', 'rotating'])
  shiftType: ShiftType;

  @ApiProperty({ description: '排班日期' })
  @IsDateString()
  scheduleDate: string;

  @ApiProperty({ description: '开始时间(HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: '结束时间(HH:mm)' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

export class UpdateShiftScheduleDto {
  @ApiPropertyOptional({ description: '班次类型', enum: ['day', 'night', 'rotating'] })
  @IsOptional()
  @IsEnum(['day', 'night', 'rotating'])
  shiftType?: ShiftType;

  @ApiPropertyOptional({ description: '排班日期' })
  @IsOptional()
  @IsDateString()
  scheduleDate?: string;

  @ApiPropertyOptional({ description: '开始时间(HH:mm)' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间(HH:mm)' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}
