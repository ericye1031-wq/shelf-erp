import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkOrderDto {
  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: 'BOM ID' })
  @IsOptional()
  @IsString()
  bomId?: string;

  @ApiPropertyOptional({ description: '货架配置ID' })
  @IsOptional()
  @IsString()
  shelfConfigId?: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '优先级', enum: ['low','normal','high','urgent'] })
  @IsOptional()
  @IsEnum(['low','normal','high','urgent'])
  priority?: string;

  @ApiPropertyOptional({ description: '计划开始日期' })
  @IsOptional()
  @IsDateString()
  plannedStart?: string;

  @ApiPropertyOptional({ description: '计划结束日期' })
  @IsOptional()
  @IsDateString()
  plannedEnd?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @IsEnum(['low','normal','high','urgent'])
  priority?: string;

  @ApiPropertyOptional({ description: '计划开始日期' })
  @IsOptional()
  @IsDateString()
  plannedStart?: string;

  @ApiPropertyOptional({ description: '计划结束日期' })
  @IsOptional()
  @IsDateString()
  plannedEnd?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class ProcessStepDto {
  @ApiProperty({ description: '工序编码' })
  @IsString()
  stepCode: string;

  @ApiProperty({ description: '工序名称' })
  @IsString()
  stepName: string;

  @ApiPropertyOptional({ description: '序号' })
  @IsOptional()
  @IsNumber()
  sequence?: number;

  @ApiPropertyOptional({ description: '设备名称' })
  @IsOptional()
  @IsString()
  equipmentName?: string;

  @ApiPropertyOptional({ description: '计划工时(分钟)' })
  @IsOptional()
  @IsNumber()
  plannedMinutes?: number;
}
