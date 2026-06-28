import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedAsset } from './fixed-asset.entity';
import { CreateFixedAssetDto, UpdateFixedAssetDto } from './dto/fixed-asset.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

export interface DepreciationScheduleItem {
  period: number;
  year: number;
  month: number;
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  netValue: number;
}

@Injectable()
export class FixedAssetService {
  constructor(
    @InjectRepository(FixedAsset)
    private readonly faRepo: Repository<FixedAsset>,
  ) {}

  /**
   * 直线法月折旧额 = (原值 × (1 - 残值率)) / (折旧年限 × 12)
   */
  calculateMonthlyDepreciation(
    originalValue: number,
    residualRate: number,
    depreciationYears: number,
  ): number {
    if (depreciationYears <= 0) return 0;
    return Number(
      ((originalValue * (1 - residualRate)) / (depreciationYears * 12)).toFixed(2),
    );
  }

  /**
   * 获取折旧计划表（从购置日期起逐月计算）
   */
  getDepreciationSchedule(asset: FixedAsset): DepreciationScheduleItem[] {
    const totalMonths = asset.depreciationYears * 12;
    const monthly = asset.monthlyDepreciation || this.calculateMonthlyDepreciation(
      asset.originalValue,
      asset.residualRate,
      asset.depreciationYears,
    );
    const purchaseDate = new Date(asset.purchaseDate);
    const schedule: DepreciationScheduleItem[] = [];

    for (let i = 1; i <= totalMonths; i++) {
      const periodDate = new Date(purchaseDate);
      periodDate.setMonth(periodDate.getMonth() + i);

      const accumulated = Number((monthly * i).toFixed(2));
      const netValue = Number(
        Math.max(asset.originalValue - accumulated, asset.originalValue * asset.residualRate).toFixed(2),
      );

      schedule.push({
        period: i,
        year: periodDate.getFullYear(),
        month: periodDate.getMonth() + 1,
        monthlyDepreciation: monthly,
        accumulatedDepreciation: accumulated,
        netValue,
      });
    }

    return schedule;
  }

  async findAll(dto: PaginationDto & { category?: string; status?: string }) {
    const { page = 1, pageSize = 20, keyword, category, status } = dto;
    const qb = this.faRepo.createQueryBuilder('fa');

    if (keyword) {
      qb.andWhere('(fa.assetCode LIKE :kw OR fa.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (category) qb.andWhere('fa.category = :category', { category });
    if (status) qb.andWhere('fa.status = :status', { status });

    qb.orderBy('fa.assetCode', 'ASC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();

    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<FixedAsset> {
    const asset = await this.faRepo.findOne({ where: { id } });
    if (!asset) throw new NotFoundException(`固定资产 ${id} 不存在`);
    return asset;
  }

  async create(dto: CreateFixedAssetDto, userId: string): Promise<FixedAsset> {
    const existing = await this.faRepo.findOne({
      where: { assetCode: dto.assetCode },
    });
    if (existing) throw new BadRequestException(`资产编码 ${dto.assetCode} 已存在`);

    const residualRate = dto.residualRate ?? 0.05;
    const monthlyDepreciation = this.calculateMonthlyDepreciation(
      dto.originalValue,
      residualRate,
      dto.depreciationYears,
    );

    const asset = this.faRepo.create({
      ...dto,
      residualRate,
      monthlyDepreciation,
      accumulatedDepreciation: 0,
      netValue: dto.originalValue,
      status: 'in_use',
      createdBy: userId,
      updatedBy: userId,
    });

    return this.faRepo.save(asset);
  }

  async update(id: string, dto: UpdateFixedAssetDto, userId: string): Promise<FixedAsset> {
    const asset = await this.findOne(id);

    // Recalculate if value, rate, or years changes
    const originalValue = dto.originalValue ?? asset.originalValue;
    const residualRate = dto.residualRate ?? asset.residualRate;
    const depreciationYears = dto.depreciationYears ?? asset.depreciationYears;

    if (
      dto.originalValue !== undefined ||
      dto.residualRate !== undefined ||
      dto.depreciationYears !== undefined
    ) {
      dto = {
        ...dto,
        monthlyDepreciation: this.calculateMonthlyDepreciation(
          originalValue,
          residualRate,
          depreciationYears,
        ),
        netValue: originalValue - asset.accumulatedDepreciation,
      } as any;
    }

    Object.assign(asset, dto, { updatedBy: userId });
    return this.faRepo.save(asset);
  }

  async dispose(id: string, userId: string): Promise<FixedAsset> {
    const asset = await this.findOne(id);
    if (asset.status === 'disposed') {
      throw new BadRequestException('该资产已处置');
    }

    asset.status = 'disposed';
    asset.netValue = 0;
    asset.updatedBy = userId;
    return this.faRepo.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.faRepo.remove(asset);
  }

  async getSchedule(id: string): Promise<DepreciationScheduleItem[]> {
    const asset = await this.findOne(id);
    return this.getDepreciationSchedule(asset);
  }
}
