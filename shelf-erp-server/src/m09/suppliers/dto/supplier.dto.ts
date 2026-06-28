import { IsString, IsOptional, IsNumber, IsDateString, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: '供应商编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '供应商名称' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: '税号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: '供应类别' })
  @IsOptional()
  @IsString()
  supplyCategories?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactName?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({ description: '联系邮箱' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactEmail?: string;

  @ApiPropertyOptional({ description: '银行账号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccount?: string;

  @ApiPropertyOptional({ description: '开户银行' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ description: '评级', enum: ['A', 'B', 'C', 'D'] })
  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  rating?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional({ description: '供应商名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '税号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: '供应类别' })
  @IsOptional()
  @IsString()
  supplyCategories?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactName?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({ description: '联系邮箱' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactEmail?: string;

  @ApiPropertyOptional({ description: '银行账号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccount?: string;

  @ApiPropertyOptional({ description: '开户银行' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ description: '评级', enum: ['A', 'B', 'C', 'D'] })
  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  rating?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
