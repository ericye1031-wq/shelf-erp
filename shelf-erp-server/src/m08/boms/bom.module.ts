import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BOM } from './bom.entity';
import { BomItem } from './bom-item.entity';
import { BomVersion } from './bom-version.entity';
import { AlternativeMaterial } from './alternative-material.entity';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BOM, BomItem, BomVersion, AlternativeMaterial])],
  controllers: [BomController],
  providers: [BomService],
  exports: [BomService],
})
export class BomModule {}
