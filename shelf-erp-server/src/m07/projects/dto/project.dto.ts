import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: '合同ID' })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: '项目经理ID' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ description: '项目经理姓名' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: '项目名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '项目经理ID' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ description: '项目经理姓名' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '进度(0-100)' })
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateMilestoneDto {
  @ApiProperty({ description: '里程碑名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '计划日期' })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMilestoneDto {
  @ApiPropertyOptional({ description: '里程碑名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '实际完成日期' })
  @IsOptional()
  @IsDateString()
  actualDate?: string;

  @ApiPropertyOptional({ description: '进度(0-100)' })
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['pending','in_progress','completed','overdue'] })
  @IsOptional()
  @IsEnum(['pending','in_progress','completed','overdue'])
  status?: string;
}
