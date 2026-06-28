import { IsString, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCostDimensionDto {
  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '报价单ID' })
  @IsOptional()
  @IsString()
  quotationId?: string;

  @ApiProperty({ description: '类型', enum: ['material','labor','overhead','outsourcing','logistics','other'] })
  @IsEnum(['material','labor','overhead','outsourcing','logistics','other'])
  type: string;

  @ApiProperty({ description: '名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '预算金额' })
  @IsOptional()
  @IsNumber()
  budgetAmount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateCostDimensionDto {
  @ApiPropertyOptional({ description: '预算金额' })
  @IsOptional()
  @IsNumber()
  budgetAmount?: number;

  @ApiPropertyOptional({ description: '实际金额' })
  @IsOptional()
  @IsNumber()
  actualAmount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
