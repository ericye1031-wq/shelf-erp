import { IsString, IsOptional, IsNumber, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFixedAssetDto {
  @ApiProperty({ description: '资产编码', example: 'FA-2024-001' })
  @IsString()
  assetCode: string;

  @ApiProperty({ description: '资产名称', example: '注塑机' })
  @IsString()
  name: string;

  @ApiProperty({ description: '资产类别', example: '机器设备' })
  @IsString()
  category: string;

  @ApiProperty({ description: '购置日期', example: '2024-01-15' })
  @IsString()
  purchaseDate: string;

  @ApiProperty({ description: '原值', example: 500000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalValue: number;

  @ApiPropertyOptional({ description: '残值率', default: 0.05, example: 0.05 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  residualRate?: number;

  @ApiProperty({ description: '折旧年限', example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  depreciationYears: number;

  @ApiPropertyOptional({ description: '保管人', example: '张三' })
  @IsOptional()
  @IsString()
  custodian?: string;

  @ApiPropertyOptional({ description: '存放地点', example: 'A车间' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateFixedAssetDto {
  @ApiPropertyOptional({ description: '资产名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '资产类别' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '购置日期' })
  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: '原值' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalValue?: number;

  @ApiPropertyOptional({ description: '残值率' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  residualRate?: number;

  @ApiPropertyOptional({ description: '折旧年限' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  depreciationYears?: number;

  @ApiPropertyOptional({ description: '保管人' })
  @IsOptional()
  @IsString()
  custodian?: string;

  @ApiPropertyOptional({ description: '存放地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: '状态',
    enum: ['in_use', 'idle', 'maintenance', 'disposed'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['in_use', 'idle', 'maintenance', 'disposed'])
  status?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
