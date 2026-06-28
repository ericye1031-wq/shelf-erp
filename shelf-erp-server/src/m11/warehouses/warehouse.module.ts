import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { Inventory, InventoryTransaction } from './inventory.entity';
import { StorageLocation, StockCount, StockCountItem } from './wms-entities';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { WmsAdvancedService } from './wms-advanced.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Warehouse, Inventory, InventoryTransaction,
    StorageLocation, StockCount, StockCountItem,
  ])],
  controllers: [WarehouseController],
  providers: [WarehouseService, WmsAdvancedService],
  exports: [WarehouseService, WmsAdvancedService],
})
export class WarehouseModule {}
