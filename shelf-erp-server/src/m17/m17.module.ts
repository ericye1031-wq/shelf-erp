import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboards/dashboard.module';
import { ReportModule } from './reports/report.module';
import { KpiModule } from './kpis/kpi.module';
import { DataSourceModule } from './data-sources/data-source.module';
import { BiAnalyticsModule } from './bi-analytics/bi-analytics.module';

@Module({
  imports: [DashboardModule, ReportModule, KpiModule, DataSourceModule, BiAnalyticsModule],
  exports: [DashboardModule, ReportModule, KpiModule, DataSourceModule, BiAnalyticsModule],
})
export class M17Module {}
