import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRequisition } from './purchase-requisition.entity';
import { PurchaseRequisitionService } from './purchase-requisition.service';
import { PurchaseRequisitionController } from './purchase-requisition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRequisition])],
  controllers: [PurchaseRequisitionController],
  providers: [PurchaseRequisitionService],
  exports: [PurchaseRequisitionService],
})
export class PurchaseRequisitionModule {}
