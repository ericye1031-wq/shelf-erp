import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateWarrantyDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsUUID()
  customerId: string;

  @IsString()
  customerName: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  warrantyType?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWarrantyDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class QueryWarrantyDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  warrantyType?: string;
}
