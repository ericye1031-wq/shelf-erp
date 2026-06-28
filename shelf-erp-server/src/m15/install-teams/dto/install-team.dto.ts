import { IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInstallTeamDto {
  @ApiProperty({ description: '安装计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '人员姓名' })
  @IsString()
  @MaxLength(50)
  workerName: string;

  @ApiProperty({ description: '角色', enum: ['队长', '安装工', '助手'] })
  @IsString()
  @IsIn(['队长', '安装工', '助手'])
  workerRole: string;

  @ApiProperty({ description: '资质状态', enum: ['valid', 'expired', 'none'] })
  @IsString()
  @IsIn(['valid', 'expired', 'none'])
  certStatus: string;

  @ApiProperty({ description: '保险状态', enum: ['active', 'expired', 'none'] })
  @IsString()
  @IsIn(['active', 'expired', 'none'])
  insuranceStatus: string;
}
