import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './work-order.entity';
import { ProcessStep } from './process-step.entity';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';
import { MaterialDemandModule } from '../material-demands/material-demand.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, ProcessStep]), MaterialDemandModule],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
