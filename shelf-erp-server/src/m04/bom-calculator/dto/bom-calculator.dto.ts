import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/** BOM项DTO */
export class BomItemResultDto {
  @ApiProperty({ description: '零件编码' })
  partCode: string;

  @ApiProperty({ description: '零件名称' })
  partName: string;

  @ApiPropertyOptional({ description: '材料' })
  material?: string;

  @ApiProperty({ description: '数量' })
  quantity: number;

  @ApiPropertyOptional({ description: '长度' })
  length?: number;

  @ApiPropertyOptional({ description: '单位' })
  unit?: string;

  @ApiPropertyOptional({ description: '单位重量' })
  unitWeight?: number;

  @ApiPropertyOptional({ description: '单位成本' })
  unitCost?: number;

  @ApiPropertyOptional({ description: '损耗率' })
  wasteRate?: number;

  @ApiPropertyOptional({ description: '总成本' })
  totalCost?: number;

  @ApiPropertyOptional({ description: '分类' })
  category?: string;

  @ApiPropertyOptional({ description: '子节点' })
  children?: BomItemResultDto[];
}

/** BOM计算结果DTO */
export class BomCalculationResultDto {
  @ApiProperty({ description: '配置ID' })
  configId: string;

  @ApiProperty({ description: '配置名称' })
  configName: string;

  @ApiProperty({ description: '规格ID' })
  specificationId: string;

  @ApiProperty({ description: '规格名称' })
  specificationName: string;

  @ApiProperty({ description: '使用的参数' })
  parameters: Record<string, string | number>;

  @ApiProperty({ description: 'BOM项列表' })
  items: BomItemResultDto[];

  @ApiProperty({ description: '材料总成本' })
  totalMaterialCost: number;

  @ApiProperty({ description: '项数' })
  totalItems: number;
}
