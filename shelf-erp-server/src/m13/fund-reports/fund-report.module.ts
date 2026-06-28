import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from '../bank-accounts/bank-account.entity';
import { BankTransaction } from '../bank-accounts/bank-transaction.entity';
import { FundReportService } from './fund-report.service';
import { FundReportController } from './fund-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, BankTransaction])],
  controllers: [FundReportController],
  providers: [FundReportService],
  exports: [FundReportService],
})
export class FundReportModule {}
