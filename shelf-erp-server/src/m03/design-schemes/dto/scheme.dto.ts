import { IsString, IsOptional, IsDateString, IsIn, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchemeDto {
  @ApiProperty({ description: '方案名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '询价单ID' })
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: '货架类型' })
  @IsOptional()
  @IsString()
  rackType?: string;

  @ApiPropertyOptional({ description: '方案描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSchemeDto {
  @ApiPropertyOptional({ description: '方案名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: '货架类型' })
  @IsOptional()
  @IsString()
  rackType?: string;

  @ApiPropertyOptional({ description: '方案描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSchemeVersionDto {
  @ApiProperty({ description: '变更摘要' })
  @IsString()
  changeSummary: string;

  @ApiPropertyOptional({ description: '附件(JSON字符串)' })
  @IsOptional()
  @IsString()
  attachments?: string;
}

export class ApproveSchemeVersionDto {
  @ApiProperty({ description: '审批人ID' })
  @IsString()
  approvedBy: string;
}
