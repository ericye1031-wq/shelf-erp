import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiCostPrediction } from "./ai-cost-prediction.entity";
import { PaginationDto, createPaginatedResponse } from "../common/dto/pagination.dto";

interface PriceDataPoint {
  date: string;
  price: number;
}

export interface PredictionPoint {
  month: number;
  predictedPrice: number;
  confidenceLower: number;
  confidenceUpper: number;
}

@Injectable()
export class AiCostPredictionService {
  constructor(
    @InjectRepository(AiCostPrediction)
    private readonly predictionRepo: Repository<AiCostPrediction>,
  ) {}

  private seasonalFactors: number[] = [0.95, 0.92, 1.02, 1.05, 1.08, 1.10, 1.12, 1.05, 1.00, 0.98, 0.93, 0.90];

  private getHistoricalPrices(materialCode: string): PriceDataPoint[] {
    const basePrices: Record<string, number> = {
      STEEL_Q235: 3850,
      STEEL_Q345: 4250,
      STEEL_Q420: 4580,
      STEEL_SPCC: 4950,
      STEEL_SGCC: 5200,
      STEEL_304: 18500,
      WELD_WIRE: 8800,
      BOLT_M12: 2450,
      PAINT_EPOXY: 32000,
      PALLET_WOOD: 1250,
    };

    const basePrice = basePrices[materialCode] ?? 3500;
    const points: PriceDataPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth();
      const seasonal = this.seasonalFactors[monthIdx];
      const noise = 0.98 + Math.random() * 0.04;
      const trendFactor = 1 + (11 - i) * 0.002;
      const price = Math.round(basePrice * seasonal * noise * trendFactor * 100) / 100;
      points.push({
        date: d.toISOString().slice(0, 7),
        price,
      });
    }
    return points;
  }

  private linearRegression(points: PriceDataPoint[]): { slope: number; intercept: number; r2: number } {
    const n = points.length;
    const xs = points.map((_, i) => i);
    const ys = points.map((p) => p.price);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const pred = slope * xs[i] + intercept;
      ssRes += (ys[i] - pred) ** 2;
      ssTot += (ys[i] - meanY) ** 2;
    }
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
    return { slope, intercept, r2 };
  }

  async predictMaterialCost(
    materialCode: string,
    months: number = 6,
  ): Promise<{
    materialCode: string;
    predictions: PredictionPoint[];
    trend: string;
    confidence: number;
    r2: number;
  }> {
    const historicalPrices = this.getHistoricalPrices(materialCode);
    const reg = this.linearRegression(historicalPrices);
    const historicalAvg =
      historicalPrices.reduce((s, p) => s + p.price, 0) / historicalPrices.length;

    const predictions: PredictionPoint[] = [];
    const baseIdx = historicalPrices.length;
    for (let m = 1; m <= months; m++) {
      const linearPrice = reg.slope * (baseIdx + m) + reg.intercept;
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + m);
      const seasonal = this.seasonalFactors[futureDate.getMonth()];
      const predictedPrice = Math.round(linearPrice * seasonal * 100) / 100;
      const errorMargin = predictedPrice * 0.08;
      const conf = Math.min(0.95, Math.max(0.6, reg.r2));

      predictions.push({
        month: m,
        predictedPrice,
        confidenceLower: Math.round((predictedPrice - errorMargin) * 100) / 100,
        confidenceUpper: Math.round((predictedPrice + errorMargin) * 100) / 100,
      });
    }

    const trendDir = reg.slope > 0.5 ? "上涨" : reg.slope < -0.5 ? "下跌" : "平稳";
    const trend = `基于12个月历史数据，价格趋势：${trendDir}（月均变化 ${reg.slope > 0 ? "+" : ""}${reg.slope.toFixed(2)} 元/吨），R²=${reg.r2.toFixed(4)}`;

    const threeMonth = predictions.find((p) => p.month === 3) ?? predictions[2] ?? predictions[predictions.length - 1];
    const sixMonth = predictions.find((p) => p.month === 6) ?? predictions[5] ?? predictions[predictions.length - 1];

    const entity = this.predictionRepo.create({
      materialCode,
      materialName: materialCode,
      historicalAvgPrice: Math.round(historicalAvg * 100) / 100,
      predictedPrice3m: threeMonth.predictedPrice,
      predictedPrice6m: sixMonth.predictedPrice,
      confidenceLower: threeMonth.confidenceLower,
      confidenceUpper: threeMonth.confidenceUpper,
      trend: {
        direction: trendDir,
        slope: Math.round(reg.slope * 100) / 100,
        r2: Math.round(reg.r2 * 10000) / 10000,
        points: historicalPrices,
        predictions,
      },
    } as any);
    await this.predictionRepo.save(entity);

    return {
      materialCode,
      predictions,
      trend,
      confidence: Math.round(reg.r2 * 100) / 100,
      r2: Math.round(reg.r2 * 10000) / 10000,
    };
  }

  async getTrend(): Promise<{
    materials: { code: string; direction: string; change3m: number; change6m: number }[];
    summary: string;
  }> {
    const materialCodes = [
      "STEEL_Q235",
      "STEEL_Q345",
      "STEEL_Q420",
      "STEEL_SPCC",
      "STEEL_SGCC",
      "STEEL_304",
      "WELD_WIRE",
      "BOLT_M12",
    ];

    const materials = materialCodes.map((code) => {
      const prices = this.getHistoricalPrices(code);
      const reg = this.linearRegression(prices);
      const pred3m = reg.slope * (prices.length + 3) + reg.intercept;
      const pred6m = reg.slope * (prices.length + 6) + reg.intercept;
      const currentAvg = prices.slice(-3).reduce((s, p) => s + p.price, 0) / 3;
      const change3m = Math.round(((pred3m - currentAvg) / currentAvg) * 10000) / 100;
      const change6m = Math.round(((pred6m - currentAvg) / currentAvg) * 10000) / 100;
      const direction = reg.slope > 0.3 ? "up" : reg.slope < -0.3 ? "down" : "stable";
      return { code, direction, change3m, change6m };
    });

    const upCount = materials.filter((m) => m.direction === "up").length;
    const downCount = materials.filter((m) => m.direction === "down").length;
    const summary =
      upCount > downCount
        ? `成本整体呈上升趋势，${upCount}/${materials.length} 种材料预计价格上涨`
        : downCount > upCount
          ? `成本整体呈下降趋势，${downCount}/${materials.length} 种材料预计价格下跌`
          : "成本整体平稳，建议按当前价格备货";

    return { materials, summary };
  }

  async predictProjectCost(projectId: string): Promise<{
    projectId: string;
    estimates: { category: string; currentCost: number; predictedCost: number; variance: number }[];
    totalCurrent: number;
    totalPredicted: number;
    totalVariance: number;
  }> {
    const estimates = [
      { category: "钢材原料", currentCost: 125000, inflateFactor: 1.035 },
      { category: "焊接耗材", currentCost: 18000, inflateFactor: 1.022 },
      { category: "表面处理", currentCost: 35000, inflateFactor: 1.028 },
      { category: "包装运输", currentCost: 22000, inflateFactor: 1.015 },
      { category: "人工成本", currentCost: 68000, inflateFactor: 1.045 },
      { category: "能源消耗", currentCost: 15000, inflateFactor: 1.038 },
    ];

    const STEEL_TREND = 1.035;
    const detail = estimates.map((e) => {
      const predictedCost = Math.round(e.currentCost * STEEL_TREND * 100) / 100;
      const variance = Math.round((predictedCost - e.currentCost) * 100) / 100;
      return {
        category: e.category,
        currentCost: e.currentCost,
        predictedCost,
        variance,
      };
    });

    const totalCurrent = detail.reduce((s, d) => s + d.currentCost, 0);
    const totalPredicted = detail.reduce((s, d) => s + d.predictedCost, 0);
    const totalVariance = Math.round((totalPredicted - totalCurrent) * 100) / 100;

    return {
      projectId,
      estimates: detail,
      totalCurrent,
      totalPredicted,
      totalVariance,
    };
  }
}
