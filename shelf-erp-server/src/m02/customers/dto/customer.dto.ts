import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: '客户名称' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '客户编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '简称' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ description: '客户类型', enum: ['direct', 'agent', 'distributor'] })
  @IsEnum(['direct', 'agent', 'distributor'])
  type: string;

  @ApiPropertyOptional({ description: '行业' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: '地区' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: '客户等级', enum: ['A', 'B', 'C', 'D'] })
  @IsEnum(['A', 'B', 'C', 'D'])
  level: string;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '客户编码' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '简称' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({ description: '客户类型' })
  @IsOptional()
  @IsEnum(['direct', 'agent', 'distributor'])
  type?: string;

  @ApiPropertyOptional({ description: '行业' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: '地区' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '客户等级' })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  level?: string;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateContactDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '是否主要联系人' })
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '是否主要联系人' })
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
