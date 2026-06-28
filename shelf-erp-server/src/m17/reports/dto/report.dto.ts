import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType, ReportFormat } from '../report.entity';

export class CreateReportDto {
  @ApiProperty({ description: '报表编号' })
  @IsString()
  reportNo: string;

  @ApiProperty({ description: '报表名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '报表类型', enum: ReportType, required: false })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ description: '报表格式', enum: ReportFormat, required: false })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ description: 'SQL查询语句', required: false })
  @IsOptional()
  @IsString()
  sqlQuery?: string;

  @ApiProperty({ description: '参数配置', required: false })
  @IsOptional()
  parameters?: any;

  @ApiProperty({ description: '列配置', required: false })
  @IsOptional()
  columns?: any[];

  @ApiProperty({ description: '筛选条件', required: false })
  @IsOptional()
  filters?: any[];

  @ApiProperty({ description: '图表配置', required: false })
  @IsOptional()
  chartConfig?: any;

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

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

export class UpdateReportDto {
  @ApiProperty({ description: '报表名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '报表类型', enum: ReportType, required: false })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ description: '报表格式', enum: ReportFormat, required: false })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ description: 'SQL查询语句', required: false })
  @IsOptional()
  @IsString()
  sqlQuery?: string;

  @ApiProperty({ description: '参数配置', required: false })
  @IsOptional()
  parameters?: any;

  @ApiProperty({ description: '列配置', required: false })
  @IsOptional()
  columns?: any[];

  @ApiProperty({ description: '筛选条件', required: false })
  @IsOptional()
  filters?: any[];

  @ApiProperty({ description: '图表配置', required: false })
  @IsOptional()
  chartConfig?: any;

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class QueryReportDto {
  @ApiProperty({ description: '报表名称（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '报表类型', enum: ReportType, required: false })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ description: '报表格式', enum: ReportFormat, required: false })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

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
