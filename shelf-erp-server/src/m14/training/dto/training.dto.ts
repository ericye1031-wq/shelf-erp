import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrainingDto {
  @ApiProperty({ description: '培训标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '培训讲师' })
  @IsOptional()
  @IsString()
  trainer?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '培训地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '培训类型' })
  @IsString()
  trainingType: string;

  @ApiPropertyOptional({ description: '培训费用' })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiPropertyOptional({ description: '参与人数' })
  @IsOptional()
  @IsNumber()
  participantCount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateTrainingDto {
  @ApiPropertyOptional({ description: '培训标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '培训讲师' })
  @IsOptional()
  @IsString()
  trainer?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '培训地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '培训费用' })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiPropertyOptional({ description: '参与人数' })
  @IsOptional()
  @IsNumber()
  participantCount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
