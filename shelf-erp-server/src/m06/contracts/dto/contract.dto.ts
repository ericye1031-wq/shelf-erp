import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiPropertyOptional({ description: '报价单ID' })
  @IsOptional()
  @IsString()
  quotationId?: string;

  @ApiProperty({ description: '客户ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  @ApiProperty({ description: '合同标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '合同金额' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: '币种ID' })
  @IsOptional()
  @IsString()
  currencyId?: string;

  @ApiPropertyOptional({ description: '签订日期' })
  @IsOptional()
  @IsDateString()
  signDate?: string;

  @ApiPropertyOptional({ description: '交货日期' })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({ description: '付款条款' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentTerms?: string;

  @ApiPropertyOptional({ description: '合同条款' })
  @IsOptional()
  @IsString()
  terms?: string;
}

export class UpdateContractDto {
  @ApiPropertyOptional({ description: '合同标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '合同金额' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: '签订日期' })
  @IsOptional()
  @IsDateString()
  signDate?: string;

  @ApiPropertyOptional({ description: '交货日期' })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({ description: '付款条款' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: '合同条款' })
  @IsOptional()
  @IsString()
  terms?: string;
}

export class CreatePaymentPlanDto {
  @ApiProperty({ description: '阶段名称' })
  @IsString()
  @MaxLength(100)
  stage: string;

  @ApiProperty({ description: '金额' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '比例' })
  @IsOptional()
  @IsNumber()
  ratio?: number;

  @ApiPropertyOptional({ description: '计划日期' })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: '发票类型', enum: ['normal', 'special'] })
  @IsEnum(['normal', 'special'])
  type: 'normal' | 'special';

  @ApiProperty({ description: '金额' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: '税率' })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: '开票日期' })
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
