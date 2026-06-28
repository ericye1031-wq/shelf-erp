import { Module } from '@nestjs/common';
import { PurchaseModule } from './purchases/purchase.module';
import { BomModule } from './boms/bom.module';

@Module({
  imports: [PurchaseModule, BomModule],
  exports: [PurchaseModule, BomModule],
})
export class M08Module {}
