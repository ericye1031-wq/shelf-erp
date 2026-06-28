import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityCheck } from './quality-check.entity';
import { Defect } from './defect.entity';
import { QualityCheckService } from './quality-check.service';
import { QualityCheckController } from './quality-check.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QualityCheck, Defect])],
  controllers: [QualityCheckController],
  providers: [QualityCheckService],
  exports: [QualityCheckService],
})
export class QualityCheckModule {}
