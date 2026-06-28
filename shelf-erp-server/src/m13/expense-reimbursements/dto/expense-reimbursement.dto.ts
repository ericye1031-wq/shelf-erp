import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const expenseTypes = ['travel', 'entertainment', 'office', 'transport', 'other'];

export class CreateExpenseReimbursementDto {
  @ApiProperty({ description: '报销单号', example: 'EXP-2024-001' })
  @IsString()
  expenseCode: string;

  @ApiProperty({ description: '申请人ID' })
  @IsString()
  applicantId: string;

  @ApiProperty({ description: '申请人姓名', example: '张三' })
  @IsString()
  applicantName: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: '费用类型', enum: expenseTypes })
  @IsString()
  @IsIn(expenseTypes)
  expenseType: string;

  @ApiProperty({ description: '报销金额', example: 1500.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: '费用说明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '附件(JSON数组)' })
  @IsOptional()
  @IsString()
  attachments?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateExpenseReimbursementDto {
  @ApiPropertyOptional({ description: '申请人姓名' })
  @IsOptional()
  @IsString()
  applicantName?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: '费用类型', enum: expenseTypes })
  @IsOptional()
  @IsString()
  @IsIn(expenseTypes)
  expenseType?: string;

  @ApiPropertyOptional({ description: '报销金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ description: '费用说明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '附件(JSON数组)' })
  @IsOptional()
  @IsString()
  attachments?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
