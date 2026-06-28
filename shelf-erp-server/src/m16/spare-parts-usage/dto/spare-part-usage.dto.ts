import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateSparePartUsageDto {
  @IsUUID()
  repairId: string;

  @IsUUID()
  inventoryId: string;

  @IsString()
  partCode: string;

  @IsString()
  partName: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSparePartUsageDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QuerySparePartUsageDto {
  @IsOptional()
  @IsUUID()
  repairId?: string;

  @IsOptional()
  @IsUUID()
  inventoryId?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
