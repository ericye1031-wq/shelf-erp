import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReceivableDto {
  @ApiProperty({ description: '客户ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: '客户名称' })
  @IsString()
  customerName: string;

  @ApiPropertyOptional({ description: '合同ID' })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiPropertyOptional({ description: '合同编号' })
  @IsOptional()
  @IsString()
  contractNo?: string;

  @ApiProperty({ description: '应收金额' })
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

export class CreateReceiptDto {
  @ApiProperty({ description: '应收ID' })
  @IsString()
  receivableId: string;

  @ApiProperty({ description: '收款金额' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: '收款日期' })
  @IsDateString()
  receiptDate: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
