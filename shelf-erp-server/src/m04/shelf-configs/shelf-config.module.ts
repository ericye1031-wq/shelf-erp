import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShelfConfig } from './shelf-config.entity';
import { ShelfType } from '../shelf-types/shelf-type.entity';
import { Specification } from '../specifications/specification.entity';
import { BomItem } from '../bom-calculator/bom-item.entity';
import { ShelfConfigService } from './shelf-config.service';
import { ShelfConfigController } from './shelf-config.controller';
import { BomCalculatorService } from '../bom-calculator/bom-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShelfConfig, ShelfType, Specification, BomItem])],
  controllers: [ShelfConfigController],
  providers: [ShelfConfigService, BomCalculatorService],
  exports: [ShelfConfigService, BomCalculatorService],
})
export class ShelfConfigModule {}
