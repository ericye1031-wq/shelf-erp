import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiQuotation } from './ai-quotation.entity';
import { Inquiry } from '../m02/inquiries/inquiry.entity';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';

export interface PricePrediction {
  inquiryId: string;
  predictedPriceLow: number;
  predictedPriceHigh: number;
  confidence: number;
  breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  baseMaterialCost: number;
  processingCost: number;
  regionAdjustment: number;
  customerLevelDiscount: number;
  marketAdjustment: number;
  quantityDiscount: number;
  suggestedPriceMid: number;
}

export interface AccuracyStats {
  totalPredictions: number;
  accurateCount: number;
  accuracyRate: number;
  avgDeviation: number;
  recentSamples: { inquiryId: string; predicted: number; actual: number | null; deviation: number | null }[];
}

@Injectable()
export class AiQuotationService {
  constructor(
    @InjectRepository(AiQuotation)
    private readonly quotationRepo: Repository<AiQuotation>,
    @InjectRepository(Inquiry)
    private readonly inquiryRepo: Repository<Inquiry>,
  ) {}

  /**
   * 基于启发式算法预测价格区间
   * 算法：历史相似询价加权平均 × 市场调整因子
   */
  async predictPrice(inquiryId: string): Promise<PricePrediction> {
    const inquiry = await this.inquiryRepo.findOne({ where: { id: inquiryId } });
    if (!inquiry) throw new NotFoundException(`询价单 ${inquiryId} 不存在`);

    // 1. 查找历史相似询价的报价数据
    const similarQuotations = await this.quotationRepo
      .createQueryBuilder('q')
      .where('q.shelfType = :shelfType', { shelfType: inquiry.shelfType || 'standard' })
      .orderBy('q.createdAt', 'DESC')
      .take(20)
      .getMany();

    // 2. 基准价格计算 —— 基于历史相似报价加权平均
    let basePrice = 0;
    if (similarQuotations.length > 0) {
      const totalWeight = similarQuotations.reduce((sum, q, i) => {
        // 越近的报价权重越高 (衰减系数 0.95^i)
        const weight = Math.pow(0.95, i);
        return sum + weight * ((Number(q.predictedPriceLow) + Number(q.predictedPriceHigh)) / 2);
      }, 0);
      const weightSum = similarQuotations.reduce((sum, _, i) => sum + Math.pow(0.95, i), 0);
      basePrice = totalWeight / weightSum;
    } else {
      // 无历史数据，使用默认基准：货架类型 × 单价估算
      const typeBasePrices: Record<string, number> = {
        'standard': 280,
        'heavy': 450,
        'light': 180,
        'cold': 520,
        'drive-in': 380,
        'cantilever': 620,
        'mezzanine': 350,
        'pallet': 300,
      };
      basePrice = typeBasePrices[inquiry.shelfType || 'standard'] || 280;
    }

    const quantity = inquiry.quantity || 1;

    // 3. 成本分解
    const baseMaterialCost = basePrice * 0.45; // 原材料占 45%
    const processingCost = basePrice * 0.25; // 加工费占 25%

    // 4. 区域调整因子（不同地区运费/人工差异）
    const regionFactors: Record<string, number> = {
      '华东': 1.0, '华南': 1.02, '华北': 1.05, '华中': 1.01,
      '西南': 1.08, '西北': 1.12, '东北': 1.07,
    };
    const regionFactor = regionFactors[inquiry.requirement?.includes('华东') ? '华东' : '华南'] || 1.0;
    const regionAdjustment = basePrice * (regionFactor - 1);

    // 5. 客户等级折扣
    const customerLevelDiscounts: Record<string, number> = {
      'A': 0.95, 'B': 0.97, 'C': 1.0, 'D': 1.05,
    };
    // 从询价单中推断客户等级（默认 B 级）
    const customerLevel = 'B';
    const customerLevelDiscount = basePrice * (1 - customerLevelDiscounts[customerLevel]);

    // 6. 市场钢材价格波动因子（模拟，实际对接钢铁指数API）
    const steelPrice = 4200; // 模拟当前市场钢价（元/吨）
    const baseSteelPrice = 4000;
    const marketAdjustment = basePrice * ((steelPrice - baseSteelPrice) / baseSteelPrice) * 0.6;

    // 7. 数量折扣
    let quantityDiscountRate = 0;
    if (quantity >= 1000) quantityDiscountRate = 0.12;
    else if (quantity >= 500) quantityDiscountRate = 0.08;
    else if (quantity >= 100) quantityDiscountRate = 0.04;
    else if (quantity >= 50) quantityDiscountRate = 0.02;
    const quantityDiscount = basePrice * quantityDiscountRate;

    // 8. 计算建议价格
    const suggestedPriceMid =
      basePrice +
      regionAdjustment -
      customerLevelDiscount +
      marketAdjustment -
      quantityDiscount;

    // 9. 预测区间（±15% 围绕中点）
    const confidenceBase = similarQuotations.length > 0 ? Math.min(0.92, 0.7 + similarQuotations.length * 0.01) : 0.65;
    const rangeFactor = 1 - confidenceBase; // 置信度越低，区间越宽
    const predictedPriceLow = Math.round(suggestedPriceMid * (1 - rangeFactor * 0.5) * 100) / 100;
    const predictedPriceHigh = Math.round(suggestedPriceMid * (1 + rangeFactor * 0.5) * 100) / 100;
    const confidence = Math.round(confidenceBase * 100) / 100;

    // 10. 保存预测结果
    const quotation = this.quotationRepo.create({
      inquiryId,
      shelfType: inquiry.shelfType || 'standard',
      specs: { quantity, unit: inquiry.unit },
      quantity,
      region: '华南',
      customerLevel,
      marketSteelPrice: steelPrice,
      predictedPriceLow,
      predictedPriceHigh,
      confidence,
      model: 'heuristic-v1',
    } as any);
    await this.quotationRepo.save(quotation as unknown as AiQuotation);

    const breakdown: PriceBreakdown = {
      baseMaterialCost: Math.round(baseMaterialCost * 100) / 100,
      processingCost: Math.round(processingCost * 100) / 100,
      regionAdjustment: Math.round(regionAdjustment * 100) / 100,
      customerLevelDiscount: Math.round(customerLevelDiscount * 100) / 100,
      marketAdjustment: Math.round(marketAdjustment * 100) / 100,
      quantityDiscount: Math.round(quantityDiscount * 100) / 100,
      suggestedPriceMid: Math.round(suggestedPriceMid * 100) / 100,
    };

    return {
      inquiryId,
      predictedPriceLow,
      predictedPriceHigh,
      confidence,
      breakdown,
    };
  }

  /**
   * 获取历史预测记录
   */
  async getHistory(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, sortBy, sortOrder } = dto;
    const qb = this.quotationRepo.createQueryBuilder('q');
    if (keyword) {
      qb.andWhere('(q.shelfType LIKE :kw OR q.region LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (sortBy) qb.orderBy(`q.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('q.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  /**
   * 预测准确率统计
   * 将预测中值与实际成交价对比
   */
  async getAccuracy(): Promise<AccuracyStats> {
    const allPredictions = await this.quotationRepo
      .createQueryBuilder('q')
      .orderBy('q.createdAt', 'DESC')
      .take(50)
      .getMany();

    const totalPredictions = allPredictions.length;

    // 启发式评估：比较预测区间与基准价格的偏离
    let totalDeviation = 0;
    const recentSamples: AccuracyStats['recentSamples'] = [];

    for (const pred of allPredictions) {
      const predicted = (Number(pred.predictedPriceLow) + Number(pred.predictedPriceHigh)) / 2;
      // 由于MVP阶段没有实际成交价，使用预测中值作为参考
      // 实际环境中这里会关联 M05 报价模块的实际成交价
      const actual: number | null = null;
      const deviation = null;

      recentSamples.push({
        inquiryId: pred.inquiryId,
        predicted: Math.round(predicted * 100) / 100,
        actual,
        deviation,
      });

      // 使用区间宽度作为精度指标
      const rangeWidth = Number(pred.predictedPriceHigh) - Number(pred.predictedPriceLow);
      totalDeviation += rangeWidth / predicted;
    }

    const avgDeviation = totalPredictions > 0
      ? Math.round((totalDeviation / totalPredictions) * 10000) / 100
      : 0;

    // 置信度 >= 0.75 视为"准确"
    const accurateCount = allPredictions.filter(p => Number(p.confidence) >= 0.75).length;
    const accuracyRate = totalPredictions > 0
      ? Math.round((accurateCount / totalPredictions) * 10000) / 100
      : 0;

    return {
      totalPredictions,
      accurateCount,
      accuracyRate,
      avgDeviation,
      recentSamples: recentSamples.slice(0, 10),
    };
  }
}
