import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';

export class SearchDrawingDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '图纸分类', enum: ['assembly', 'component', 'part', 'installation', 'foundation'] })
  @IsOptional()
  @IsIn(['assembly', 'component', 'part', 'installation', 'foundation'])
  category?: string;
}

export class CreateDrawingDto {
  @ApiProperty({ description: '图纸名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '方案ID' })
  @IsOptional()
  @IsString()
  schemeId?: string;

  @ApiProperty({ description: '图纸分类', enum: ['assembly', 'component', 'part', 'installation', 'foundation'] })
  @IsIn(['assembly', 'component', 'part', 'installation', 'foundation'])
  category: string;

  @ApiProperty({ description: '文件URL' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ description: '文件大小(字节)' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: '文件类型' })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateDrawingDto {
  @ApiPropertyOptional({ description: '图纸名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '方案ID' })
  @IsOptional()
  @IsString()
  schemeId?: string;

  @ApiPropertyOptional({ description: '图纸分类', enum: ['assembly', 'component', 'part', 'installation', 'foundation'] })
  @IsOptional()
  @IsIn(['assembly', 'component', 'part', 'installation', 'foundation'])
  category?: string;

  @ApiPropertyOptional({ description: '文件URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: '文件大小(字节)' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: '文件类型' })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
