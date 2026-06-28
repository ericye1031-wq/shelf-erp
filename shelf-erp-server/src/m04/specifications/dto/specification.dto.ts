import { IsString, IsOptional, IsObject, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecificationDto {
  @ApiProperty({ description: '货架类型ID' })
  @IsString()
  shelfTypeId: string;

  @ApiProperty({ description: '规格名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '参数约束' })
  @IsOptional()
  @IsObject()
  parameterConstraints?: Record<string, { min?: number; max?: number }>;

  @ApiPropertyOptional({ description: '结构模板', type: 'array' })
  @IsOptional()
  @IsArray()
  structureTemplate?: unknown[];
}

export class UpdateSpecificationDto {
  @ApiPropertyOptional({ description: '规格名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '参数约束' })
  @IsOptional()
  @IsObject()
  parameterConstraints?: Record<string, { min?: number; max?: number }>;

  @ApiPropertyOptional({ description: '结构模板', type: 'array' })
  @IsOptional()
  @IsArray()
  structureTemplate?: unknown[];
}
