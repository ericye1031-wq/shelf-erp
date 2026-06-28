import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryDto {
  @ApiProperty({ description: '员工ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: '员工姓名' })
  @IsString()
  employeeName: string;

  @ApiProperty({ description: '薪资月份(YYYY-MM)' })
  @IsString()
  salaryMonth: string;

  @ApiProperty({ description: '基本工资' })
  @IsNumber()
  baseSalary: number;

  @ApiPropertyOptional({ description: '加班工资' })
  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @ApiPropertyOptional({ description: '奖金' })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional({ description: '补贴' })
  @IsOptional()
  @IsNumber()
  allowance?: number;

  @ApiPropertyOptional({ description: '扣款' })
  @IsOptional()
  @IsNumber()
  deduction?: number;

  @ApiPropertyOptional({ description: '社保' })
  @IsOptional()
  @IsNumber()
  socialInsurance?: number;

  @ApiPropertyOptional({ description: '公积金' })
  @IsOptional()
  @IsNumber()
  housingFund?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSalaryDto {
  @ApiPropertyOptional({ description: '加班工资' })
  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @ApiPropertyOptional({ description: '奖金' })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiPropertyOptional({ description: '补贴' })
  @IsOptional()
  @IsNumber()
  allowance?: number;

  @ApiPropertyOptional({ description: '扣款' })
  @IsOptional()
  @IsNumber()
  deduction?: number;

  @ApiPropertyOptional({ description: '社保' })
  @IsOptional()
  @IsNumber()
  socialInsurance?: number;

  @ApiPropertyOptional({ description: '公积金' })
  @IsOptional()
  @IsNumber()
  housingFund?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
