import { IsString, IsOptional, IsNumber, IsDateString, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseRequisitionDto {
  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ description: '物料编码' })
  @IsString()
  @MaxLength(50)
  materialCode: string;

  @ApiProperty({ description: '物料名称' })
  @IsString()
  @MaxLength(200)
  materialName: string;

  @ApiPropertyOptional({ description: '规格' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '单位', default: '个' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: '需求日期' })
  @IsOptional()
  @IsDateString()
  demandDate?: string;

  @ApiPropertyOptional({ description: '建议供应商ID' })
  @IsOptional()
  @IsString()
  suggestedSupplierId?: string;

  @ApiPropertyOptional({ description: '紧急程度', enum: ['normal', 'urgent'] })
  @IsOptional()
  @IsIn(['normal', 'urgent'])
  urgency?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdatePurchaseRequisitionDto {
  @ApiPropertyOptional({ description: '项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '物料编码' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  materialCode?: string;

  @ApiPropertyOptional({ description: '物料名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  materialName?: string;

  @ApiPropertyOptional({ description: '规格' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: '需求日期' })
  @IsOptional()
  @IsDateString()
  demandDate?: string;

  @ApiPropertyOptional({ description: '建议供应商ID' })
  @IsOptional()
  @IsString()
  suggestedSupplierId?: string;

  @ApiPropertyOptional({ description: '紧急程度', enum: ['normal', 'urgent'] })
  @IsOptional()
  @IsIn(['normal', 'urgent'])
  urgency?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
