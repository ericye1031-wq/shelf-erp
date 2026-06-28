import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const invoiceTypes = ['sales', 'purchase'];

export class CreateInvoiceDto {
  @ApiProperty({ description: '发票代码', example: '144031800111' })
  @IsString()
  invoiceCode: string;

  @ApiProperty({ description: '发票号码', example: '87654321' })
  @IsString()
  invoiceNo: string;

  @ApiProperty({ description: '发票类型', enum: invoiceTypes })
  @IsString()
  @IsIn(invoiceTypes)
  invoiceType: string;

  @ApiPropertyOptional({ description: '关联单据ID（采购订单/销售合同）' })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional({ description: '关联单据类型', example: 'purchase_order' })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiProperty({ description: '开票日期', example: '2024-03-15' })
  @IsString()
  issueDate: string;

  @ApiProperty({ description: '不含税金额', example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: '税额', example: 1300 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount: number;

  @ApiProperty({ description: '价税合计', example: 11300 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ description: '供应商/购买方名称' })
  @IsOptional()
  @IsString()
  supplierBuyer?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: '发票代码' })
  @IsOptional()
  @IsString()
  invoiceCode?: string;

  @ApiPropertyOptional({ description: '发票号码' })
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @ApiPropertyOptional({ description: '发票类型', enum: invoiceTypes })
  @IsOptional()
  @IsString()
  @IsIn(invoiceTypes)
  invoiceType?: string;

  @ApiPropertyOptional({ description: '关联单据ID' })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional({ description: '关联单据类型' })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiPropertyOptional({ description: '开票日期' })
  @IsOptional()
  @IsString()
  issueDate?: string;

  @ApiPropertyOptional({ description: '不含税金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: '税额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: '价税合计' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: '供应商/购买方名称' })
  @IsOptional()
  @IsString()
  supplierBuyer?: string;

  @ApiPropertyOptional({
    description: '发票状态',
    enum: ['draft', 'issued', 'received', 'voided', 'returned'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'issued', 'received', 'voided', 'returned'])
  status?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
