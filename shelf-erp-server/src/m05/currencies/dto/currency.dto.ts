import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ description: '货币编码', example: 'CNY' })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiProperty({ description: '货币名称', example: '人民币' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '货币符号', example: '¥' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  symbol?: string;

  @ApiPropertyOptional({ description: '汇率', example: 1.0 })
  @IsOptional()
  @IsNumber()
  rate?: number;
}

export class UpdateCurrencyDto {
  @ApiPropertyOptional({ description: '货币名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '货币符号' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ description: '汇率' })
  @IsOptional()
  @IsNumber()
  rate?: number;
}
