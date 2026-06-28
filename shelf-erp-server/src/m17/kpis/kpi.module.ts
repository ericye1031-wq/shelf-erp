import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KPI } from './kpi.entity';
import { KpiService } from './kpi.service';
import { KpiController } from './kpi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KPI])],
  providers: [KpiService],
  controllers: [KpiController],
  exports: [KpiService],
})
export class KpiModule {}
