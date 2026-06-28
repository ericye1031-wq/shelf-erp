import { IsString, IsOptional, IsNumber, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PDAReportDto {
  @ApiProperty({ description: '安装计划ID' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ description: '班组ID' })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({ description: '工人姓名' })
  @IsString()
  @MaxLength(50)
  workerName: string;

  @ApiProperty({ description: '工作日期' })
  @IsDateString()
  workDate: string;

  @ApiPropertyOptional({ description: '扫码二维码内容' })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({ description: '开始时间 HH:mm' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间 HH:mm' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: '加班小时' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtimeHours?: number;

  @ApiPropertyOptional({ description: '工作内容' })
  @IsOptional()
  @IsString()
  workContent?: string;

  @ApiPropertyOptional({ description: '完工百分比' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercent?: number;

  @ApiPropertyOptional({ description: '现场照片附件(JSON数组字符串)' })
  @IsOptional()
  @IsString()
  photoAttachments?: string;
}

export class DailyReportQueryDto {
  @ApiProperty({ description: '查询日期', example: '2025-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: '班组ID' })
  @IsOptional()
  @IsString()
  teamId?: string;
}

export class CreateInstallReportDto {
  @ApiProperty({ description: '安装计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '工人姓名' })
  @IsString()
  @MaxLength(50)
  workerName: string;

  @ApiProperty({ description: '工作日期' })
  @IsDateString()
  workDate: string;

  @ApiPropertyOptional({ description: '开始时间 HH:mm' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间 HH:mm' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: '加班小时' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtimeHours?: number;

  @ApiPropertyOptional({ description: '工作内容' })
  @IsOptional()
  @IsString()
  workContent?: string;

  @ApiPropertyOptional({ description: '完工百分比' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercent?: number;
}
