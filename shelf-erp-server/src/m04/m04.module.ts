import { Module } from '@nestjs/common';
import { ShelfTypeModule } from './shelf-types/shelf-type.module';
import { SpecificationModule } from './specifications/specification.module';
import { ShelfConfigModule } from './shelf-configs/shelf-config.module';
import { BomCalculatorModule } from './bom-calculator/bom-calculator.module';

@Module({
  imports: [ShelfTypeModule, SpecificationModule, ShelfConfigModule, BomCalculatorModule],
  exports: [ShelfTypeModule, SpecificationModule, ShelfConfigModule, BomCalculatorModule],
})
export class M04Module {}
