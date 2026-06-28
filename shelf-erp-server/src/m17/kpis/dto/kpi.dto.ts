import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KPIType, KPIUnit, KPITrend } from '../kpi.entity';

export class CreateKpiDto {
  @ApiProperty({ description: 'KPI编号' })
  @IsString()
  kpiNo: string;

  @ApiProperty({ description: 'KPI名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'KPI类型', enum: KPIType, required: false })
  @IsOptional()
  @IsEnum(KPIType)
  type?: KPIType;

  @ApiProperty({ description: '单位', enum: KPIUnit, required: false })
  @IsOptional()
  @IsEnum(KPIUnit)
  unit?: KPIUnit;

  @ApiProperty({ description: '计算方式/公式' })
  @IsString()
  calculation: string;

  @ApiProperty({ description: '目标值', required: false })
  @IsOptional()
  @IsNumber()
  target?: number;

  @ApiProperty({ description: '实际值', required: false })
  @IsOptional()
  @IsNumber()
  actual?: number;

  @ApiProperty({ description: '达成率(%)', required: false })
  @IsOptional()
  @IsNumber()
  achievementRate?: number;

  @ApiProperty({ description: '趋势', enum: KPITrend, required: false })
  @IsOptional()
  @IsEnum(KPITrend)
  trend?: KPITrend;

  @ApiProperty({ description: '趋势值', required: false })
  @IsOptional()
  @IsString()
  trendValue?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '创建人' })
  @IsString()
  createdBy: string;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdateKpiDto {
  @ApiProperty({ description: 'KPI名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'KPI类型', enum: KPIType, required: false })
  @IsOptional()
  @IsEnum(KPIType)
  type?: KPIType;

  @ApiProperty({ description: '单位', enum: KPIUnit, required: false })
  @IsOptional()
  @IsEnum(KPIUnit)
  unit?: KPIUnit;

  @ApiProperty({ description: '计算方式/公式', required: false })
  @IsOptional()
  @IsString()
  calculation?: string;

  @ApiProperty({ description: '目标值', required: false })
  @IsOptional()
  @IsNumber()
  target?: number;

  @ApiProperty({ description: '实际值', required: false })
  @IsOptional()
  @IsNumber()
  actual?: number;

  @ApiProperty({ description: '达成率(%)', required: false })
  @IsOptional()
  @IsNumber()
  achievementRate?: number;

  @ApiProperty({ description: '趋势', enum: KPITrend, required: false })
  @IsOptional()
  @IsEnum(KPITrend)
  trend?: KPITrend;

  @ApiProperty({ description: '趋势值', required: false })
  @IsOptional()
  @IsString()
  trendValue?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class QueryKpiDto {
  @ApiProperty({ description: 'KPI名称（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'KPI类型', enum: KPIType, required: false })
  @IsOptional()
  @IsEnum(KPIType)
  type?: KPIType;

  @ApiProperty({ description: '单位', enum: KPIUnit, required: false })
  @IsOptional()
  @IsEnum(KPIUnit)
  unit?: KPIUnit;

  @ApiProperty({ description: '趋势', enum: KPITrend, required: false })
  @IsOptional()
  @IsEnum(KPITrend)
  trend?: KPITrend;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '创建人', required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
