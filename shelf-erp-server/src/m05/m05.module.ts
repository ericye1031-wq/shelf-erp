import { Module } from '@nestjs/common';
import { QuotationModule } from './quotations/quotation.module';
import { CurrencyModule } from './currencies/currency.module';

@Module({
  imports: [QuotationModule, CurrencyModule],
  exports: [QuotationModule, CurrencyModule],
})
export class M05Module {}
