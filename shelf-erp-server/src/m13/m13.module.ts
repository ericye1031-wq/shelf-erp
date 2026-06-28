import { Module } from '@nestjs/common';
import { AccountModule } from './accounts/account.module';
import { VoucherModule } from './vouchers/voucher.module';
import { ReceivableModule } from './receivables/receivable.module';
import { PayableModule } from './payables/payable.module';
import { BankAccountModule } from './bank-accounts/bank-account.module';
import { FundReportModule } from './fund-reports/fund-report.module';
import { FixedAssetModule } from './fixed-assets/fixed-asset.module';
import { ExpenseReimbursementModule } from './expense-reimbursements/expense-reimbursement.module';
import { InvoiceModule } from './invoice-management/invoice.module';

@Module({
  imports: [
    AccountModule,
    VoucherModule,
    ReceivableModule,
    PayableModule,
    BankAccountModule,
    FundReportModule,
    FixedAssetModule,
    ExpenseReimbursementModule,
    InvoiceModule,
  ],
  exports: [
    AccountModule,
    VoucherModule,
    ReceivableModule,
    PayableModule,
    BankAccountModule,
    FundReportModule,
    FixedAssetModule,
    ExpenseReimbursementModule,
    InvoiceModule,
  ],
})
export class M13Module {}
