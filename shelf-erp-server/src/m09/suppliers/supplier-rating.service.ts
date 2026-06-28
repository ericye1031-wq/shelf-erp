import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Supplier, SupplierRating } from "./supplier.entity";
import { SupplierRatingRecord, SupplierPrice, SupplierQuote } from "./supplier-entities";

export interface RatingScore {
  deliveryRate: number;
  qualityRate: number;
  priceScore: number;
  serviceScore: number;
  totalScore: number;
  rating: SupplierRating;
}

@Injectable()
export class SupplierRatingService {
  constructor(
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(SupplierRatingRecord) private ratingRepo: Repository<SupplierRatingRecord>,
    @InjectRepository(SupplierPrice) private priceRepo: Repository<SupplierPrice>,
    @InjectRepository(SupplierQuote) private quoteRepo: Repository<SupplierQuote>,
  ) {}

  /**
   * 供应商评级引擎 (SRS §8.1)
   * 交期达成率(40%) + 质量合格率(30%) + 价格竞争力(20%) + 服务响应(10%)
   */
  calculateRating(
    deliveryRate: number,
    qualityRate: number,
    priceScore: number,
    serviceScore: number,
  ): RatingScore {
    const totalScore =
      deliveryRate * 0.4 + qualityRate * 0.3 + priceScore * 0.2 + serviceScore * 0.1;
    let rating: SupplierRating = "C";
    if (totalScore >= 90) rating = "A";
    else if (totalScore >= 75) rating = "B";
    else if (totalScore >= 60) rating = "C";
    else rating = "D";
    return { deliveryRate, qualityRate, priceScore, serviceScore, totalScore, rating };
  }

  async rateSupplier(
    supplierId: string,
    scores: { deliveryRate: number; qualityRate: number; priceScore: number; serviceScore: number },
    userId: string,
    period: string,
  ): Promise<RatingScore> {
    const result = this.calculateRating(scores.deliveryRate, scores.qualityRate, scores.priceScore, scores.serviceScore);
    const record = this.ratingRepo.create({
      supplierId, ...scores, period,
      totalScore: result.totalScore, rating: result.rating,
      createdBy: userId,
    } as any);
    await this.ratingRepo.save(record as any);
    await this.supplierRepo.update(supplierId, { rating: result.rating as any });
    return result;
  }

  async getRatingHistory(supplierId: string): Promise<SupplierRatingRecord[]> {
    return this.ratingRepo.find({ where: { supplierId }, order: { createdAt: "DESC" } });
  }
}
