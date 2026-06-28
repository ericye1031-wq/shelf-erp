import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFollowUpDto {
  @ApiProperty({ description: '客户ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: '商机ID' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiProperty({ description: '跟进类型', enum: ['call', 'visit', 'email', 'wechat', 'other'] })
  @IsEnum(['call', 'visit', 'email', 'wechat', 'other'])
  type: string;

  @ApiProperty({ description: '跟进内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '下一步动作' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nextAction?: string;

  @ApiPropertyOptional({ description: '下次跟进日期' })
  @IsOptional()
  @IsString()
  nextDate?: string;
}
