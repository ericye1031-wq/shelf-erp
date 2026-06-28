import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivingInspection } from './receiving-inspection.entity';
import { ReceivingInspectionService } from './receiving-inspection.service';
import { ReceivingInspectionController } from './receiving-inspection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivingInspection])],
  controllers: [ReceivingInspectionController],
  providers: [ReceivingInspectionService],
  exports: [ReceivingInspectionService],
})
export class ReceivingInspectionModule {}
