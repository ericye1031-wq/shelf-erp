import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DashboardType, WidgetType } from '../dashboard.entity';

export class CreateDashboardDto {
  @ApiProperty({ description: '仪表板编号' })
  @IsString()
  dashboardNo: string;

  @ApiProperty({ description: '仪表板名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '仪表板类型', enum: DashboardType, required: false })
  @IsOptional()
  @IsEnum(DashboardType)
  type?: DashboardType;

  @ApiProperty({ description: '布局配置', required: false })
  @IsOptional()
  layout?: any;

  @ApiProperty({ description: '组件配置', required: false })
  @IsOptional()
  widgets?: any[];

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '创建人' })
  @IsString()
  createdBy: string;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdateDashboardDto {
  @ApiProperty({ description: '仪表板名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '仪表板类型', enum: DashboardType, required: false })
  @IsOptional()
  @IsEnum(DashboardType)
  type?: DashboardType;

  @ApiProperty({ description: '布局配置', required: false })
  @IsOptional()
  layout?: any;

  @ApiProperty({ description: '组件配置', required: false })
  @IsOptional()
  widgets?: any[];

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class QueryDashboardDto {
  @ApiProperty({ description: '仪表板名称（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '仪表板类型', enum: DashboardType, required: false })
  @IsOptional()
  @IsEnum(DashboardType)
  type?: DashboardType;

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

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
