import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceReview, PerformanceStatus } from './performance-review.entity';
import { CreatePerformanceDto, UpdatePerformanceDto } from './dto/performance.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceReview)
    private readonly perfRepo: Repository<PerformanceReview>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.perfRepo.createQueryBuilder('p');
    if (keyword) {
      qb.andWhere('(p.employeeName LIKE :kw OR p.periodLabel LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('p.status = :status', { status });
    if (sortBy) qb.orderBy(`p.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('p.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<PerformanceReview> {
    const perf = await this.perfRepo.findOne({ where: { id } });
    if (!perf) throw new NotFoundException(`绩效记录 ${id} 不存在`);
    return perf;
  }

  async create(dto: CreatePerformanceDto, userId: string): Promise<PerformanceReview> {
    const kpi = dto.kpiScore ?? undefined;
    const attitude = dto.attitudeScore ?? undefined;
    const skill = dto.skillScore ?? undefined;
    let totalScore: number | undefined = undefined;
    if (kpi !== undefined && attitude !== undefined && skill !== undefined) {
      totalScore = (kpi + attitude + skill) / 3;
    }

    const perf = this.perfRepo.create({
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      reviewPeriod: dto.reviewPeriod,
      periodLabel: dto.periodLabel,
      reviewerId: dto.reviewerId ?? undefined,
      reviewerName: dto.reviewerName ?? undefined,
      kpiScore: kpi,
      attitudeScore: attitude,
      skillScore: skill,
      totalScore,
      status: 'draft' as PerformanceStatus,
      remark: dto.remark ?? undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.perfRepo.save(perf);
  }

  async update(id: string, dto: UpdatePerformanceDto, userId: string): Promise<PerformanceReview> {
    const perf = await this.findOne(id);
    if (perf.status !== 'draft') throw new BadRequestException('只有草稿状态才能编辑');
    Object.assign(perf, dto, { updatedBy: userId });
    // 重新计算总分
    if (perf.kpiScore !== undefined && perf.kpiScore !== null &&
        perf.attitudeScore !== undefined && perf.attitudeScore !== null &&
        perf.skillScore !== undefined && perf.skillScore !== null) {
      perf.totalScore = (perf.kpiScore + perf.attitudeScore + perf.skillScore) / 3;
    }
    return this.perfRepo.save(perf);
  }

  async remove(id: string): Promise<void> {
    const perf = await this.findOne(id);
    if (perf.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.perfRepo.remove(perf);
  }

  async changeStatus(id: string, status: PerformanceStatus, userId: string): Promise<PerformanceReview> {
    const perf = await this.findOne(id);
    const validTransitions: Record<string, PerformanceStatus[]> = {
      draft: ['submitted'],
      submitted: ['reviewed', 'draft'],
      reviewed: ['confirmed', 'draft'],
      confirmed: [],
    };
    const allowed = validTransitions[perf.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${perf.status} 变更为 ${status}`);
    perf.status = status;
    perf.updatedBy = userId;
    return this.perfRepo.save(perf);
  }
}
