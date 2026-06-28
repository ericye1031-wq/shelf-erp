import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './quotation.entity';
import { CostItem } from './cost-item.entity';
import { QuotationVersion } from './quotation-version.entity';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation, CostItem, QuotationVersion])],
  controllers: [QuotationController],
  providers: [QuotationService],
  exports: [QuotationService],
})
export class QuotationModule {}
