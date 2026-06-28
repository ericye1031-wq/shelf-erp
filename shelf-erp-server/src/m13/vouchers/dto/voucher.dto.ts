import { IsString, IsOptional, IsArray, IsDateString, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VoucherEntryDto {
  @ApiProperty({ description: '科目ID' })
  @IsString()
  accountId: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '借方金额', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  debitAmount?: number;

  @ApiPropertyOptional({ description: '贷方金额', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditAmount?: number;

  @ApiPropertyOptional({ description: '辅助核算数据(JSON)' })
  @IsOptional()
  @IsString()
  auxData?: string;

  @ApiPropertyOptional({ description: '排序号', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateVoucherDto {
  @ApiProperty({ description: '凭证日期' })
  @IsDateString()
  voucherDate: string;

  @ApiPropertyOptional({ description: '附件数', default: 0 })
  @IsOptional()
  @IsNumber()
  attachmentCount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '分录列表', type: [VoucherEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoucherEntryDto)
  entries: VoucherEntryDto[];
}

export class UpdateVoucherDto {
  @ApiPropertyOptional({ description: '凭证日期' })
  @IsOptional()
  @IsDateString()
  voucherDate?: string;

  @ApiPropertyOptional({ description: '附件数' })
  @IsOptional()
  @IsNumber()
  attachmentCount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '分录列表' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoucherEntryDto)
  entries?: VoucherEntryDto[];
}

export class AuditVoucherDto {
  @ApiProperty({ description: '审核意见', enum: ['approve', 'reject'] })
  @IsString()
  action: 'approve' | 'reject';
}
