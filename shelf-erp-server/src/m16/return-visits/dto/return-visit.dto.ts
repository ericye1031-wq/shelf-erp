import { IsString, IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class CreateReturnVisitDto {
  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @IsUUID()
  customerId: string;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  visitMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionScore?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsUUID()
  visitedBy?: string;

  @IsOptional()
  @IsString()
  visitedByName?: string;
}

export class UpdateReturnVisitDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionScore?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  visitedAt?: string;
}

export class QueryReturnVisitDto {
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
  @IsUUID()
  ticketId?: string;
}
