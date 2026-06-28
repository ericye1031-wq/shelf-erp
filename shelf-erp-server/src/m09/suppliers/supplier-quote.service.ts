import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierPrice, SupplierQuote } from "./supplier-entities";

@Injectable()
export class SupplierQuoteService {
  constructor(
    @InjectRepository(SupplierPrice) private priceRepo: Repository<SupplierPrice>,
    @InjectRepository(SupplierQuote) private quoteRepo: Repository<SupplierQuote>,
  ) {}

  /** 供应商价格库管理 */
  async findAllPrices(supplierId?: string): Promise<SupplierPrice[]> {
    const where = supplierId ? { supplierId, isActive: true } : { isActive: true };
    return this.priceRepo.find({ where, order: { createdAt: "DESC" } });
  }

  async addPrice(data: Partial<SupplierPrice>): Promise<SupplierPrice> {
    const entity = this.priceRepo.create(data as any);
    return this.priceRepo.save(entity) as unknown as SupplierPrice;
  }

  /** 询比价: 提交报价 */
  async submitQuote(data: {
    requisitionId: string; supplierId: string; supplierName: string;
    materialCode: string; materialName: string; spec?: string;
    unitPrice: number; quantity: number; currency?: string;
    deliveryDays: number; remark?: string;
  }): Promise<SupplierQuote> {
    const quote = this.quoteRepo.create({
      ...data,
      currency: data.currency ?? "CNY",
      totalAmount: data.unitPrice * data.quantity,
      status: "submitted",
      submittedAt: new Date(),
    } as any);
    return this.quoteRepo.save(quote) as unknown as SupplierQuote;
  }

  /** 比价分析: 对同一请购单的多个报价排序 */
  async compareQuotes(requisitionId: string): Promise<{
    quotes: SupplierQuote[];
    bestSupplier: SupplierQuote | null;
    avgPrice: number;
    range: { min: number; max: number };
  }> {
    const quotes = await this.quoteRepo.find({
      where: { requisitionId },
      order: { unitPrice: "ASC" },
    });
    if (quotes.length === 0) return { quotes: [], bestSupplier: null, avgPrice: 0, range: { min: 0, max: 0 } };
    const prices = quotes.map((q) => Number(q.unitPrice));
    return {
      quotes,
      bestSupplier: quotes[0],
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      range: { min: Math.min(...prices), max: Math.max(...prices) },
    };
  }

  /** 根据物料编码查询所有供应商报价 */
  async getPricesByMaterial(materialCode: string): Promise<SupplierPrice[]> {
    return this.priceRepo.find({
      where: { materialCode, isActive: true },
      order: { unitPrice: "ASC" },
    });
  }
}
