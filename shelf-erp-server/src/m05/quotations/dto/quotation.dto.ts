import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, MaxLength, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CostCategory } from '../cost-item.entity';

/** 创建报价单DTO */
export class CreateQuotationDto {
  @ApiPropertyOptional({ description: '询价单ID' })
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @ApiProperty({ description: '客户ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  @ApiPropertyOptional({ description: '货架类型ID' })
  @IsOptional()
  @IsString()
  shelfTypeId?: string;

  @ApiPropertyOptional({ description: '货架类型名称' })
  @IsOptional()
  @IsString()
  shelfTypeName?: string;

  @ApiPropertyOptional({ description: '配置ID' })
  @IsOptional()
  @IsString()
  configId?: string;

  @ApiPropertyOptional({ description: '配置名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  configName?: string;

  @ApiProperty({ description: '数量', example: 100 })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '单价' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: '总价' })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiPropertyOptional({ description: '币种ID' })
  @IsOptional()
  @IsString()
  currencyId?: string;

  @ApiPropertyOptional({ description: '汇率' })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiPropertyOptional({ description: '利润率' })
  @IsOptional()
  @IsNumber()
  margin?: number;

  @ApiPropertyOptional({ description: '交货天数' })
  @IsOptional()
  @IsNumber()
  deliveryDays?: number;

  @ApiPropertyOptional({ description: '有效期至' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/** 更新报价单DTO */
export class UpdateQuotationDto {
  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: '单价' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: '总价' })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiPropertyOptional({ description: '利润率' })
  @IsOptional()
  @IsNumber()
  margin?: number;

  @ApiPropertyOptional({ description: '交货天数' })
  @IsOptional()
  @IsNumber()
  deliveryDays?: number;

  @ApiPropertyOptional({ description: '有效期至' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/** 成本项DTO */
export class CreateCostItemDto {
  @ApiProperty({ description: '分类', enum: ['material','labor','overhead','outsourcing','logistics','other'] })
  @IsEnum(['material','labor','overhead','outsourcing','logistics','other'])
  category: CostCategory;

  @ApiProperty({ description: '名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '金额' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

/** 版本对比结果DTO */
export class VersionCompareDto {
  @ApiProperty({ description: '版本1' })
  @IsNumber()
  v1: number;

  @ApiProperty({ description: '版本2' })
  @IsNumber()
  v2: number;
}
