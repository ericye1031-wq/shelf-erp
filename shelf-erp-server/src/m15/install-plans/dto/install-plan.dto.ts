import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstallPlanDto {
  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '合同ID' })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiProperty({ description: '安装地址' })
  @IsString()
  siteAddress: string;

  @ApiPropertyOptional({ description: '安装开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '安装结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '安全交底' })
  @IsOptional()
  @IsString()
  safetyBriefing?: string;
}

export class UpdateInstallPlanDto {
  @ApiPropertyOptional({ description: '安装地址' })
  @IsOptional()
  @IsString()
  siteAddress?: string;

  @ApiPropertyOptional({ description: '安装开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '安装结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '安全交底' })
  @IsOptional()
  @IsString()
  safetyBriefing?: string;
}
