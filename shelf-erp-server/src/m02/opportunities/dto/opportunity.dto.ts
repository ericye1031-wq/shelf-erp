import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ description: '客户ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: '商机标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @ApiProperty({ description: '阶段', enum: ['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] })
  @IsEnum(['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
  stage: string;

  @ApiPropertyOptional({ description: '胜率' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  probability?: number;

  @ApiPropertyOptional({ description: '预计成交日期' })
  @IsOptional()
  @IsString()
  expectedDate?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateOpportunityDto {
  @ApiPropertyOptional({ description: '商机标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: '阶段' })
  @IsOptional()
  @IsEnum(['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
  stage?: string;

  @ApiPropertyOptional({ description: '胜率' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  probability?: number;

  @ApiPropertyOptional({ description: '预计成交日期' })
  @IsOptional()
  @IsString()
  expectedDate?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateStageDto {
  @ApiProperty({ description: '新阶段', enum: ['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] })
  @IsEnum(['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
  stage: string;

  @ApiPropertyOptional({ description: '胜率' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  probability?: number;
}
