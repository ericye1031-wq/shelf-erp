import { IsString, IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class CreateRepairDto {
  @IsUUID()
  ticketId: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @IsOptional()
  @IsString()
  equipmentName?: string;

  @IsString()
  faultDesc: string;

  @IsOptional()
  @IsString()
  faultLevel?: string;

  @IsOptional()
  @IsString()
  repairDesc?: string;

  @IsOptional()
  @IsString()
  partsUsed?: string;

  @IsOptional()
  @IsNumber()
  repairCost?: number;

  @IsOptional()
  @IsUUID()
  repairBy?: string;

  @IsOptional()
  @IsString()
  repairByName?: string;
}

export class UpdateRepairDto {
  @IsOptional()
  @IsString()
  faultDesc?: string;

  @IsOptional()
  @IsString()
  faultLevel?: string;

  @IsOptional()
  @IsString()
  repairDesc?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  partsUsed?: string;

  @IsOptional()
  @IsNumber()
  repairCost?: number;

  @IsOptional()
  @IsUUID()
  repairBy?: string;

  @IsOptional()
  @IsString()
  repairByName?: string;
}

export class QueryRepairDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;
}
