import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: '仓库名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '仓库编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '位置' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '类型' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: '管理员' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: '仓库名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '位置' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '管理员' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class InventoryInboundDto {
  @ApiProperty({ description: '仓库ID' })
  @IsString()
  warehouseId: string;

  @ApiProperty({ description: '零件名称' })
  @IsString()
  partName: string;

  @ApiPropertyOptional({ description: '零件编码' })
  @IsOptional()
  @IsString()
  partCode?: string;

  @ApiPropertyOptional({ description: '材料' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: '规格' })
  @IsOptional()
  @IsString()
  spec?: string;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '安全库存' })
  @IsOptional()
  @IsNumber()
  safetyStock?: number;

  @ApiPropertyOptional({ description: '批次号' })
  @IsOptional()
  @IsString()
  batchNo?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class InventoryOutboundDto {
  @ApiProperty({ description: '库存ID' })
  @IsString()
  inventoryId: string;

  @ApiProperty({ description: '出库数量' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
