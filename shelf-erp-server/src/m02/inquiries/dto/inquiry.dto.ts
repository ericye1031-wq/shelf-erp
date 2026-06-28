import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({ description: '客户ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: '商机ID' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional({ description: '货架类型' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shelfType?: string;

  @ApiPropertyOptional({ description: '需求描述' })
  @IsOptional()
  @IsString()
  requirement?: string;

  @ApiProperty({ description: '数量' })
  @Type(() => Number)
  @IsInt()
  quantity: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '交货日期' })
  @IsOptional()
  @IsString()
  deliveryDate?: string;
}

export class UpdateInquiryDto {
  @ApiPropertyOptional({ description: '货架类型' })
  @IsOptional()
  @IsString()
  shelfType?: string;

  @ApiPropertyOptional({ description: '需求描述' })
  @IsOptional()
  @IsString()
  requirement?: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quantity?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '交货日期' })
  @IsOptional()
  @IsString()
  deliveryDate?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}
