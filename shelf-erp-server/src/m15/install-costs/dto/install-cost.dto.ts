import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstallCostDto {
  @ApiProperty({ description: '安装计划ID' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ description: '人工费' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  laborFee?: number;

  @ApiPropertyOptional({ description: '差旅费' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFee?: number;

  @ApiPropertyOptional({ description: '住宿费' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accommodationFee?: number;

  @ApiPropertyOptional({ description: '工具消耗' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  toolCost?: number;

  @ApiPropertyOptional({ description: '辅材消耗' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  materialCost?: number;
}

export class UpdateInstallCostDto {
  @ApiPropertyOptional({ description: '人工费' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  laborFee?: number;

  @ApiPropertyOptional({ description: '差旅费' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelFee?: number;

  @ApiPropertyOptional({ description: '住宿费' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accommodationFee?: number;

  @ApiPropertyOptional({ description: '工具消耗' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  toolCost?: number;

  @ApiPropertyOptional({ description: '辅材消耗' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  materialCost?: number;
}
