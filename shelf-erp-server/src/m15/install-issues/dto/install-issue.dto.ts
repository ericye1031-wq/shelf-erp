import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstallIssueDto {
  @ApiProperty({ description: '安装计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '问题类型', enum: ['缺件', '损坏', '设计变更', '客户追加需求', '其他'] })
  @IsString()
  @IsIn(['缺件', '损坏', '设计变更', '客户追加需求', '其他'])
  issueType: string;

  @ApiProperty({ description: '严重程度', enum: ['low', 'medium', 'high', 'critical'] })
  @IsString()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity: string;

  @ApiProperty({ description: '问题描述' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '现场照片URL数组', type: [String] })
  @IsOptional()
  photoUrls?: string[];
}

export class UpdateInstallIssueDto {
  @ApiPropertyOptional({ description: '状态', enum: ['open', 'in_progress', 'resolved'] })
  @IsOptional()
  @IsString()
  @IsIn(['open', 'in_progress', 'resolved'])
  status?: string;

  @ApiPropertyOptional({ description: '解决方案' })
  @IsOptional()
  @IsString()
  solution?: string;
}
