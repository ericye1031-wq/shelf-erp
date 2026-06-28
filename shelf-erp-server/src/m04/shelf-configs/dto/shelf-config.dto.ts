import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShelfConfigDto {
  @ApiProperty({ description: '货架类型ID' })
  @IsString()
  shelfTypeId: string;

  @ApiProperty({ description: '配置名称' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: '参数键值对' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, string | number>;
}

export class UpdateShelfConfigDto {
  @ApiPropertyOptional({ description: '配置名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '参数键值对' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, string | number>;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;
}
