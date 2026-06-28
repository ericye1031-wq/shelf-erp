import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './supplier.entity';
import { SupplierPrice, SupplierQuote, SupplierRatingRecord } from './supplier-entities';
import { SupplierService } from './supplier.service';
import { SupplierRatingService } from './supplier-rating.service';
import { SupplierQuoteService } from './supplier-quote.service';
import { SupplierController, SupplierQuoteController } from './supplier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, SupplierPrice, SupplierQuote, SupplierRatingRecord])],
  controllers: [SupplierController, SupplierQuoteController],
  providers: [SupplierService, SupplierRatingService, SupplierQuoteService],
  exports: [SupplierService, SupplierRatingService, SupplierQuoteService],
})
export class SupplierModule {}
