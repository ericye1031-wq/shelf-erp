import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BiAnalyticsService } from './bi-analytics.service';

@ApiTags('M17 - BI分析')
@Controller('m17/analytics')
export class BiAnalyticsController {
  constructor(private readonly service: BiAnalyticsService) {}

  @Get('sales-dashboard')
  @ApiOperation({ summary: '销售仪表板数据' })
  getSalesDashboard() {
    return this.service.getSalesDashboard();
  }

  @Get('production-dashboard')
  @ApiOperation({ summary: '生产仪表板数据' })
  getProductionDashboard() {
    return this.service.getProductionDashboard();
  }

  @Get('inventory-dashboard')
  @ApiOperation({ summary: '库存仪表板数据' })
  getInventoryDashboard() {
    return this.service.getInventoryDashboard();
  }

  @Get('finance-dashboard')
  @ApiOperation({ summary: '财务仪表板数据' })
  getFinanceDashboard() {
    return this.service.getFinanceDashboard();
  }

  @Get('project-profit')
  @ApiOperation({ summary: '项目利润分析数据' })
  getProjectProfitDashboard() {
    return this.service.getProjectProfitDashboard();
  }

  @Get('ceo-dashboard')
  @ApiOperation({ summary: 'CEO综合仪表板数据' })
  getCEODashboard() {
    return this.service.getCEODashboard();
  }
}
