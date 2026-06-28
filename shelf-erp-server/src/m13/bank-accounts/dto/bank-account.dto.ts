import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ description: '账户名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '账号' })
  @IsString()
  accountNo: string;

  @ApiProperty({ description: '银行名称' })
  @IsString()
  bankName: string;

  @ApiPropertyOptional({ description: '支行名称' })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiPropertyOptional({ description: '币种', default: 'CNY' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: '期初余额', default: 0 })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({ description: '账户类型', enum: ['cash', 'bank', 'other'] })
  @IsOptional()
  @IsString()
  @IsIn(['cash', 'bank', 'other'])
  accountType?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateBankAccountDto {
  @ApiPropertyOptional({ description: '账户名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '银行名称' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: '支行名称' })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateBankTransactionDto {
  @ApiProperty({ description: '银行账户ID' })
  @IsString()
  bankAccountId: string;

  @ApiProperty({ description: '交易日期' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ description: '交易描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '收支方向', enum: ['in', 'out'] })
  @IsString()
  @IsIn(['in', 'out'])
  direction: string;

  @ApiProperty({ description: '金额' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: '参考号' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
