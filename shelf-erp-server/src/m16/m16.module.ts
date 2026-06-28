import { Module } from '@nestjs/common';
import { ServiceTicketModule } from './service-tickets/service-ticket.module';
import { RepairModule } from './repairs/repair.module';
import { InspectionModule } from './inspections/inspection.module';
import { ReturnVisitModule } from './return-visits/return-visit.module';
import { WarrantyModule } from './warranties/warranty.module';
import { SparePartUsageModule } from './spare-parts-usage/spare-part-usage.module';

@Module({
  imports: [
    ServiceTicketModule,
    RepairModule,
    InspectionModule,
    ReturnVisitModule,
    WarrantyModule,
    SparePartUsageModule,
  ],
})
export class M16Module {}
