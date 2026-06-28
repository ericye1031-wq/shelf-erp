import { IsString, IsOptional, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ description: '员工ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: '员工姓名' })
  @IsString()
  employeeName: string;

  @ApiProperty({ description: '考勤日期' })
  @IsDateString()
  recordDate: string;

  @ApiPropertyOptional({ description: '上班打卡时间' })
  @IsOptional()
  @IsString()
  clockIn?: string;

  @ApiPropertyOptional({ description: '下班打卡时间' })
  @IsOptional()
  @IsString()
  clockOut?: string;

  @ApiProperty({ description: '考勤状态', enum: ['normal', 'late', 'early', 'absent', 'leave', 'overtime'] })
  @IsEnum(['normal', 'late', 'early', 'absent', 'leave', 'overtime'])
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'overtime';

  @ApiPropertyOptional({ description: '请假类型' })
  @IsOptional()
  @IsString()
  leaveType?: string;

  @ApiPropertyOptional({ description: '加班时长(小时)' })
  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ description: '上班打卡时间' })
  @IsOptional()
  @IsString()
  clockIn?: string;

  @ApiPropertyOptional({ description: '下班打卡时间' })
  @IsOptional()
  @IsString()
  clockOut?: string;

  @ApiPropertyOptional({ description: '考勤状态' })
  @IsOptional()
  @IsEnum(['normal', 'late', 'early', 'absent', 'leave', 'overtime'])
  status?: 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'overtime';

  @ApiPropertyOptional({ description: '请假类型' })
  @IsOptional()
  @IsString()
  leaveType?: string;

  @ApiPropertyOptional({ description: '加班时长' })
  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
