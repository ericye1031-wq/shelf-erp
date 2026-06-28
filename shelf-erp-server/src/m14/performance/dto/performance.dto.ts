import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePerformanceDto {
  @ApiProperty({ description: '员工ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: '员工姓名' })
  @IsString()
  employeeName: string;

  @ApiProperty({ description: '考核周期类型', enum: ['monthly', 'quarterly', 'annual'] })
  @IsEnum(['monthly', 'quarterly', 'annual'])
  reviewPeriod: 'monthly' | 'quarterly' | 'annual';

  @ApiProperty({ description: '周期标签(如 2026-Q2)' })
  @IsString()
  periodLabel: string;

  @ApiPropertyOptional({ description: '考核人ID' })
  @IsOptional()
  @IsString()
  reviewerId?: string;

  @ApiPropertyOptional({ description: '考核人姓名' })
  @IsOptional()
  @IsString()
  reviewerName?: string;

  @ApiPropertyOptional({ description: 'KPI得分' })
  @IsOptional()
  @IsNumber()
  kpiScore?: number;

  @ApiPropertyOptional({ description: '态度得分' })
  @IsOptional()
  @IsNumber()
  attitudeScore?: number;

  @ApiPropertyOptional({ description: '技能得分' })
  @IsOptional()
  @IsNumber()
  skillScore?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdatePerformanceDto {
  @ApiPropertyOptional({ description: 'KPI得分' })
  @IsOptional()
  @IsNumber()
  kpiScore?: number;

  @ApiPropertyOptional({ description: '态度得分' })
  @IsOptional()
  @IsNumber()
  attitudeScore?: number;

  @ApiPropertyOptional({ description: '技能得分' })
  @IsOptional()
  @IsNumber()
  skillScore?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
