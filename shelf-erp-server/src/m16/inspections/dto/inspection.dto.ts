import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateInspectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  inspectionType?: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @IsOptional()
  @IsString()
  equipmentName?: string;

  @IsOptional()
  @IsUUID()
  inspector?: string;

  @IsOptional()
  @IsString()
  inspectorName?: string;
}

export class UpdateInspectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsString()
  issueDesc?: string;

  @IsOptional()
  @IsString()
  handleSuggestion?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  inspectedAt?: string;
}

export class QueryInspectionDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;
}
