import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostDimension } from './cost-dimension.entity';
import { CostAlert } from './cost-alert.entity';
import { CreateCostDimensionDto, UpdateCostDimensionDto } from './dto/cost.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class CostService {
  constructor(
    @InjectRepository(CostDimension)
    private readonly costRepo: Repository<CostDimension>,
    @InjectRepository(CostAlert)
    private readonly alertRepo: Repository<CostAlert>,
  ) {}

  // ---- 成本维度 ----
  async findAll(dto: PaginationDto & { projectId?: string; quotationId?: string }) {
    const { page = 1, pageSize = 20, projectId, quotationId } = dto;
    const qb = this.costRepo.createQueryBuilder('cd');
    if (projectId) qb.andWhere('cd.projectId = :projectId', { projectId });
    if (quotationId) qb.andWhere('cd.quotationId = :quotationId', { quotationId });
    qb.orderBy('cd.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<CostDimension> {
    const cost = await this.costRepo.findOne({ where: { id } });
    if (!cost) throw new NotFoundException(`成本维度 ${id} 不存在`);
    return cost;
  }

  async create(dto: CreateCostDimensionDto, userId: string): Promise<CostDimension> {
    const cost = this.costRepo.create({
      projectId: dto.projectId ?? null,
      quotationId: dto.quotationId ?? null,
      type: dto.type as CostDimension['type'],
      name: dto.name,
      budgetAmount: dto.budgetAmount ?? 0,
      actualAmount: 0,
      varianceAmount: -(dto.budgetAmount ?? 0),
      varianceRate: 0,
      remark: dto.remark,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.costRepo.save(cost);
  }

  async update(id: string, dto: UpdateCostDimensionDto, userId: string): Promise<CostDimension> {
    const cost = await this.findOne(id);
    if (dto.budgetAmount !== undefined) cost.budgetAmount = dto.budgetAmount;
    if (dto.actualAmount !== undefined) cost.actualAmount = dto.actualAmount;
    cost.varianceAmount = cost.actualAmount - cost.budgetAmount;
    cost.varianceRate = cost.budgetAmount > 0
      ? cost.varianceAmount / cost.budgetAmount
      : 0;
    cost.remark = dto.remark ?? cost.remark;
    cost.updatedBy = userId;

    // 检查是否触发预警（超预算10%以上）
    if (cost.varianceRate > 0.1) {
      await this.alertRepo.save(this.alertRepo.create({
        projectId: cost.projectId,
        costDimensionId: cost.id,
        level: cost.varianceRate > 0.3 ? 'critical' : 'warning',
        title: `成本超支预警: ${cost.name}`,
        content: `${cost.name} 实际成本 ${cost.actualAmount} 超出预算 ${cost.budgetAmount}，偏差率 ${(cost.varianceRate * 100).toFixed(1)}%`,
        thresholdValue: cost.budgetAmount * 1.1,
        actualValue: cost.actualAmount,
        triggeredAt: new Date(),
      }));
    }

    return this.costRepo.save(cost);
  }

  /** 项目成本汇总 */
  async getProjectCostSummary(projectId: string) {
    const dimensions = await this.costRepo.find({ where: { projectId } });
    const totalBudget = dimensions.reduce((s, d) => s + Number(d.budgetAmount), 0);
    const totalActual = dimensions.reduce((s, d) => s + Number(d.actualAmount), 0);
    return {
      projectId,
      totalBudget,
      totalActual,
      totalVariance: totalActual - totalBudget,
      varianceRate: totalBudget > 0 ? (totalActual - totalBudget) / totalBudget : 0,
      breakdown: dimensions,
    };
  }

  // ---- 成本预警 ----
  async getAlerts(projectId?: string): Promise<CostAlert[]> {
    const qb = this.alertRepo.createQueryBuilder('ca')
      .where('ca.isResolved = false');
    if (projectId) qb.andWhere('ca.projectId = :projectId', { projectId });
    qb.orderBy('ca.triggeredAt', 'DESC');
    return qb.getMany();
  }

  async resolveAlert(alertId: string): Promise<CostAlert> {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`成本预警 ${alertId} 不存在`);
    alert.isRead = true;
    alert.isResolved = true;
    alert.resolvedAt = new Date();
    return this.alertRepo.save(alert);
  }
}
