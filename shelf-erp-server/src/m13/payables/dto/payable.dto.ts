import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayableDto {
  @ApiProperty({ description: '供应商ID' })
  @IsString()
  supplierId: string;

  @ApiProperty({ description: '供应商名称' })
  @IsString()
  supplierName: string;

  @ApiPropertyOptional({ description: '采购单号' })
  @IsOptional()
  @IsString()
  purchaseOrderNo?: string;

  @ApiProperty({ description: '应付金额' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: '到期日' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePaymentRequestDto {
  @ApiProperty({ description: '应付ID' })
  @IsString()
  payableId: string;

  @ApiProperty({ description: '申请金额' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: '申请日期' })
  @IsDateString()
  requestDate: string;

  @ApiPropertyOptional({ description: '付款银行账户ID' })
  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ description: '应付ID' })
  @IsString()
  payableId: string;

  @ApiProperty({ description: '付款金额' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: '付款日期' })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional({ description: '付款银行账户ID' })
  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class ApprovePaymentRequestDto {
  @ApiProperty({ description: '审批操作', enum: ['approve', 'reject'] })
  @IsString()
  action: 'approve' | 'reject';
}
