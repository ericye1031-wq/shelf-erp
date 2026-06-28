import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ description: '组织名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '组织编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '上级组织ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '组织类型', enum: ['group', 'company', 'factory', 'department'] })
  @IsEnum(['group', 'company', 'factory', 'department'])
  type: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contact?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: '排序号' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ description: '组织名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '组织编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: '上级组织ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '组织类型' })
  @IsOptional()
  @IsEnum(['group', 'company', 'factory', 'department'])
  type?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '排序号' })
  @IsOptional()
  @IsInt()
  sort?: number;
}
