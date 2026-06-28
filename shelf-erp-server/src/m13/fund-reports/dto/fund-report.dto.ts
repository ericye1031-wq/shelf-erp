import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FundDailyReportQueryDto {
  @ApiProperty({ description: '报表日期' })
  @IsDateString()
  date: string;
}

export class FundDailyReportDto {
  date: string;
  accounts: {
    id: string;
    name: string;
    accountNo: string;
    bankName: string;
    balance: number;
  }[];
  summary: {
    totalBalance: number;
    totalIn: number;
    totalOut: number;
    netFlow: number;
  };
}
