import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DataSourceType } from '../data-source.entity';

export class CreateDataSourceDto {
  @ApiProperty({ description: '数据源编号' })
  @IsString()
  sourceNo: string;

  @ApiProperty({ description: '数据源名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '数据源类型', enum: DataSourceType, required: false })
  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;

  @ApiProperty({ description: '连接字符串', required: false })
  @IsOptional()
  @IsString()
  connectionString?: string;

  @ApiProperty({ description: '配置信息', required: false })
  @IsOptional()
  config?: any;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '是否默认数据源', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: '创建人' })
  @IsString()
  createdBy: string;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdateDataSourceDto {
  @ApiProperty({ description: '数据源名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '数据源类型', enum: DataSourceType, required: false })
  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;

  @ApiProperty({ description: '连接字符串', required: false })
  @IsOptional()
  @IsString()
  connectionString?: string;

  @ApiProperty({ description: '配置信息', required: false })
  @IsOptional()
  config?: any;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '是否默认数据源', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: '最后测试时间', required: false })
  @IsOptional()
  @IsString()
  lastTestAt?: string;

  @ApiProperty({ description: '最后测试结果', required: false })
  @IsOptional()
  @IsBoolean()
  lastTestSuccess?: boolean;

  @ApiProperty({ description: '更新人', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class QueryDataSourceDto {
  @ApiProperty({ description: '数据源名称（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '数据源类型', enum: DataSourceType, required: false })
  @IsOptional()
  @IsEnum(DataSourceType)
  type?: DataSourceType;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '是否默认数据源', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

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
