import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitESignatureDto {
  @ApiProperty({ description: '电子签名数据(base64图片或data URL)' })
  @IsString()
  signatureData: string;

  @ApiPropertyOptional({ description: '签署人姓名' })
  @IsOptional()
  @IsString()
  signerName?: string;
}

export class CreateInstallAcceptanceDto {
  @ApiProperty({ description: '安装计划ID' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ description: '合同ID' })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiPropertyOptional({ description: '验收日期' })
  @IsOptional()
  @IsDateString()
  acceptDate?: string;

  @ApiPropertyOptional({ description: '客户签字(base64或路径)' })
  @IsOptional()
  @IsString()
  customerSign?: string;

  @ApiProperty({ description: '验收结果', enum: ['passed', 'with_issues', 'failed'] })
  @IsString()
  @IsIn(['passed', 'with_issues', 'failed'])
  result: string;

  @ApiPropertyOptional({ description: '整改问题描述' })
  @IsOptional()
  @IsString()
  issueDesc?: string;

  @ApiPropertyOptional({ description: '质保期开始日期' })
  @IsOptional()
  @IsDateString()
  warrantyStartDate?: string;

  @ApiPropertyOptional({ description: '质保期结束日期' })
  @IsOptional()
  @IsDateString()
  warrantyEndDate?: string;
}
