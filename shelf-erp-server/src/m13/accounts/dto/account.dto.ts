import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: '科目编码', example: '1001' })
  @IsString()
  code: string;

  @ApiProperty({ description: '科目名称', example: '库存现金' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '父科目ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '类别', enum: ['资产', '负债', '权益', '成本', '损益'] })
  @IsString()
  @IsIn(['资产', '负债', '权益', '成本', '损益'])
  category: string;

  @ApiPropertyOptional({ description: '余额方向', enum: ['debit', 'credit'], default: 'debit' })
  @IsOptional()
  @IsString()
  @IsIn(['debit', 'credit'])
  balanceDirection?: string;

  @ApiPropertyOptional({ description: '是否为叶子科目', default: true })
  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean;

  @ApiPropertyOptional({ description: '是否启用辅助核算', default: false })
  @IsOptional()
  @IsBoolean()
  hasAux?: boolean;

  @ApiPropertyOptional({ description: '辅助核算类型(JSON字符串)' })
  @IsOptional()
  @IsString()
  auxTypes?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: '科目名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '父科目ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '类别' })
  @IsOptional()
  @IsString()
  @IsIn(['资产', '负债', '权益', '成本', '损益'])
  category?: string;

  @ApiPropertyOptional({ description: '余额方向' })
  @IsOptional()
  @IsString()
  @IsIn(['debit', 'credit'])
  balanceDirection?: string;

  @ApiPropertyOptional({ description: '是否为叶子科目' })
  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean;

  @ApiPropertyOptional({ description: '是否启用辅助核算' })
  @IsOptional()
  @IsBoolean()
  hasAux?: boolean;

  @ApiPropertyOptional({ description: '辅助核算类型' })
  @IsOptional()
  @IsString()
  auxTypes?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}
