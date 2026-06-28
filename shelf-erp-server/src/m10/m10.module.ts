import { Module } from '@nestjs/common';
import { WorkOrderModule } from './work-orders/work-order.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScanRecordModule } from './scan-records/scan-record.module';
import { QualityCheckModule } from './quality-checks/quality-check.module';
import { OeeModule } from './oee/oee.module';
import { ProcessRouteModule } from './process-routes/process-route.module';

@Module({
  imports: [
    WorkOrderModule,
    EquipmentModule,
    ScheduleModule,
    ScanRecordModule,
    QualityCheckModule,
    OeeModule,
    ProcessRouteModule,
  ],
  exports: [
    WorkOrderModule,
    EquipmentModule,
    ScheduleModule,
    ScanRecordModule,
    QualityCheckModule,
    OeeModule,
    ProcessRouteModule,
  ],
})
export class M10Module {}
