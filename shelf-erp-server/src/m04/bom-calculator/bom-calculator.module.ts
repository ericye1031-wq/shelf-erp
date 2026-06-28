import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomItem } from './bom-item.entity';
import { ShelfConfig } from '../shelf-configs/shelf-config.entity';
import { ShelfType } from '../shelf-types/shelf-type.entity';
import { Specification } from '../specifications/specification.entity';
import { BomCalculatorService } from './bom-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([BomItem, ShelfConfig, ShelfType, Specification])],
  providers: [BomCalculatorService],
  exports: [BomCalculatorService],
})
export class BomCalculatorModule {}
