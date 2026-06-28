import { IsString, IsOptional, IsNumber, IsDateString, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReceivingInspectionDto {
  @ApiProperty({ description: '采购订单ID' })
  @IsString()
  purchaseOrderId: string;

  @ApiProperty({ description: '采购订单编码' })
  @IsString()
  @MaxLength(50)
  purchaseOrderCode: string;

  @ApiProperty({ description: '检验单号' })
  @IsString()
  @MaxLength(50)
  inspectionNo: string;

  @ApiProperty({ description: '检验员' })
  @IsString()
  @MaxLength(100)
  inspector: string;

  @ApiProperty({ description: '检验日期' })
  @IsDateString()
  inspectionDate: string;

  @ApiProperty({ description: '外观检验', enum: ['pass', 'fail'] })
  @IsIn(['pass', 'fail'])
  appearance: string;

  @ApiProperty({ description: '尺寸检验', enum: ['pass', 'fail'] })
  @IsIn(['pass', 'fail'])
  dimension: string;

  @ApiProperty({ description: '材料质量', enum: ['pass', 'fail'] })
  @IsIn(['pass', 'fail'])
  materialQuality: string;

  @ApiProperty({ description: '涂层检验', enum: ['pass', 'fail'] })
  @IsIn(['pass', 'fail'])
  coating: string;

  @ApiProperty({ description: '数量核对', enum: ['pass', 'fail'] })
  @IsIn(['pass', 'fail'])
  quantityCheck: string;

  @ApiProperty({ description: '检验结果', enum: ['accepted', 'concession', 'returned'] })
  @IsIn(['accepted', 'concession', 'returned'])
  result: string;

  @ApiPropertyOptional({ description: '缺陷描述' })
  @IsOptional()
  @IsString()
  defectDesc?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateReceivingInspectionDto {
  @ApiPropertyOptional({ description: '检验员' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  inspector?: string;

  @ApiPropertyOptional({ description: '检验日期' })
  @IsOptional()
  @IsDateString()
  inspectionDate?: string;

  @ApiPropertyOptional({ description: '外观检验', enum: ['pass', 'fail'] })
  @IsOptional()
  @IsIn(['pass', 'fail'])
  appearance?: string;

  @ApiPropertyOptional({ description: '尺寸检验', enum: ['pass', 'fail'] })
  @IsOptional()
  @IsIn(['pass', 'fail'])
  dimension?: string;

  @ApiPropertyOptional({ description: '材料质量', enum: ['pass', 'fail'] })
  @IsOptional()
  @IsIn(['pass', 'fail'])
  materialQuality?: string;

  @ApiPropertyOptional({ description: '涂层检验', enum: ['pass', 'fail'] })
  @IsOptional()
  @IsIn(['pass', 'fail'])
  coating?: string;

  @ApiPropertyOptional({ description: '数量核对', enum: ['pass', 'fail'] })
  @IsOptional()
  @IsIn(['pass', 'fail'])
  quantityCheck?: string;

  @ApiPropertyOptional({ description: '检验结果', enum: ['accepted', 'concession', 'returned'] })
  @IsOptional()
  @IsIn(['accepted', 'concession', 'returned'])
  result?: string;

  @ApiPropertyOptional({ description: '缺陷描述' })
  @IsOptional()
  @IsString()
  defectDesc?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
