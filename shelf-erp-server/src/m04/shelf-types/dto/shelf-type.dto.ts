import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParameterDef } from '../shelf-type.entity';

export class CreateShelfTypeDto {
  @ApiProperty({ description: '货架类型名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '货架类型编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '参数模板', type: 'array' })
  @IsOptional()
  @IsArray()
  parameterTemplate?: ParameterDef[];
}

export class UpdateShelfTypeDto {
  @ApiPropertyOptional({ description: '货架类型名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '货架类型编码' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '参数模板', type: 'array' })
  @IsOptional()
  @IsArray()
  parameterTemplate?: ParameterDef[];

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}
