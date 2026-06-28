import { Module } from '@nestjs/common';
import { SupplierModule } from './suppliers/supplier.module';
import { PurchaseRequisitionModule } from './requisitions/purchase-requisition.module';
import { ReceivingInspectionModule } from './inspections/receiving-inspection.module';

@Module({
  imports: [SupplierModule, PurchaseRequisitionModule, ReceivingInspectionModule],
  exports: [SupplierModule, PurchaseRequisitionModule, ReceivingInspectionModule],
})
export class M09Module {}
