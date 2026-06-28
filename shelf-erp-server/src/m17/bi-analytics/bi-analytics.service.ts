import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  SalesDashboardDto,
  ProductionDashboardDto,
  InventoryDashboardDto,
  FinanceDashboardDto,
  ProjectProfitDashboardDto,
  CEODashboardDto,
} from './bi-analytics.types';

@Injectable()
export class BiAnalyticsService {
  constructor(private readonly entityManager: EntityManager) {}

  /**
   * 销售仪表板：月度签约额、报价转化率、机会转化率、平均报价周期、客户流失率
   */
  async getSalesDashboard(): Promise<SalesDashboardDto> {
    const months = this.last12Months();

    // MVP: mock data; production should query m02 contracts/opportunities
    const monthlySignedAmount = months.map(() =>
      Math.round(800000 + Math.random() * 400000),
    );

    return {
      monthlySignedAmount,
      months,
      quoteConversionRate: 32.5,
      opportunityConversionRate: 18.2,
      avgQuoteCycleDays: 14.3,
      customerChurnRate: 5.8,
      topCustomers: [
        { name: '客户A', amount: 1560000 },
        { name: '客户B', amount: 1280000 },
        { name: '客户C', amount: 960000 },
        { name: '客户D', amount: 820000 },
        { name: '客户E', amount: 750000 },
      ],
    };
  }

  /**
   * 生产仪表板：日产量(吨)、计划达成率、OEE、不良率、在制品价值、设备故障率
   */
  async getProductionDashboard(): Promise<ProductionDashboardDto> {
    const dates = this.last7Days();
    const dailyOutputTons = dates.map(() =>
      Math.round((45 + Math.random() * 20) * 100) / 100,
    );

    return {
      dailyOutputTons,
      dates,
      planAchievementRate: 94.7,
      oeeAvg: 82.3,
      defectRate: 2.1,
      wipValue: 4500000,
      equipmentFailureRate: 3.5,
      lineUtilization: [
        { line: 'A线-轻钢货架', rate: 87.5 },
        { line: 'B线-中重型货架', rate: 92.1 },
        { line: 'C线-定制货架', rate: 78.3 },
        { line: 'D线-表面处理', rate: 85.6 },
      ],
    };
  }

  /**
   * 库存仪表板：总库存价值、周转天数、呆滞库存、安全库存预警
   */
  async getInventoryDashboard(): Promise<InventoryDashboardDto> {
    const categoryBreakdown = [
      { category: '型材', value: 3200000 },
      { category: '板材', value: 2100000 },
      { category: '五金配件', value: 1800000 },
      { category: '标准件', value: 950000 },
      { category: '包材', value: 350000 },
    ];

    const totalInventoryValue = categoryBreakdown.reduce(
      (sum, c) => sum + c.value,
      0,
    );

    return {
      totalInventoryValue,
      turnoverDays: 45.2,
      slowMovingValue: 850000,
      safetyStockAlerts: 12,
      categoryBreakdown,
    };
  }

  /**
   * 财务仪表板：月度营收、毛利率、总应收、现金余额
   */
  async getFinanceDashboard(): Promise<FinanceDashboardDto> {
    const months = this.last12Months();
    const monthlyRevenue = months.map(() =>
      Math.round(1200000 + Math.random() * 600000),
    );

    return {
      monthlyRevenue,
      months,
      grossMargin: 28.6,
      totalAR: 8200000,
      totalAP: 5600000,
      cashBalance: 4500000,
    };
  }

  /**
   * 项目利润仪表板：活跃项目数、合同总额、利润排名、延期项目、超支项目
   */
  async getProjectProfitDashboard(): Promise<ProjectProfitDashboardDto> {
    return {
      activeProjectsCount: 18,
      activeContractTotal: 25600000,
      projectMarginRanking: [
        { name: 'XX物流仓库货架项目', margin: 32.5 },
        { name: 'YY汽车零部件仓储项目', margin: 28.7 },
        { name: 'ZZ电商配送中心项目', margin: 25.1 },
        { name: 'AA制造工厂货架改造', margin: 22.8 },
        { name: 'BB冷链仓储货架采购', margin: 19.3 },
      ],
      delayedProjects: 3,
      costOverrunProjects: 2,
    };
  }

  /**
   * CEO仪表板：今日产值、月度签约/回款/利润、现金、TOP10应收、产能负荷、重点项目进度、客户满意度、12月利润趋势
   */
  async getCEODashboard(): Promise<CEODashboardDto> {
    const profitTrendMonths = this.last12Months();
    const profitTrend12m = profitTrendMonths.map(() =>
      Math.round(250000 + Math.random() * 350000),
    );

    return {
      todayOutputValue: 385000,
      monthlySignedAmount: 5800000,
      monthlyCollectionAmount: 4200000,
      monthlyProfit: 1680000,
      cashBalance: 4500000,
      top10AR: [
        { name: '客户A', amount: 1560000 },
        { name: '客户B', amount: 1280000 },
        { name: '客户C', amount: 960000 },
        { name: '客户D', amount: 820000 },
        { name: '客户E', amount: 750000 },
        { name: '客户F', amount: 680000 },
        { name: '客户G', amount: 620000 },
        { name: '客户H', amount: 540000 },
        { name: '客户I', amount: 480000 },
        { name: '客户J', amount: 420000 },
      ],
      capacityLoadRate: 76.5,
      keyProjectProgress: [
        { name: 'XX物流仓库货架项目', progress: 72 },
        { name: 'YY汽车零部件仓储项目', progress: 45 },
        { name: 'ZZ电商配送中心项目', progress: 88 },
        { name: 'AA制造工厂货架改造', progress: 30 },
        { name: 'BB冷链仓储货架采购', progress: 15 },
      ],
      customerSatisfactionAvg: 4.2,
      profitTrend12m,
      profitTrendMonths,
    };
  }

  // Helpers
  private last12Months(): string[] {
    const result: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return result;
  }

  private last7Days(): string[] {
    const result: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return result;
  }
}
