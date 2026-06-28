import { Module } from '@nestjs/common';
import { WarehouseModule } from './warehouses/warehouse.module';

@Module({
  imports: [WarehouseModule],
  exports: [WarehouseModule],
})
export class M11Module {}
