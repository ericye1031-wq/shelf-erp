import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallPlan, InstallPlanStatus } from './install-plan.entity';
import { CreateInstallPlanDto, UpdateInstallPlanDto } from './dto/install-plan.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class InstallPlanService {
  constructor(
    @InjectRepository(InstallPlan)
    private readonly planRepo: Repository<InstallPlan>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.planRepo.createQueryBuilder('ip');
    if (keyword) {
      qb.andWhere('(ip.code LIKE :kw OR ip.siteAddress LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('ip.status = :status', { status });
    if (sortBy) qb.orderBy(`ip.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ip.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<InstallPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`安装计划 ${id} 不存在`);
    return plan;
  }

  async create(dto: CreateInstallPlanDto, userId: string): Promise<InstallPlan> {
    const count = await this.planRepo.count();
    const code = generateCode('install', count + 1);
    const plan = this.planRepo.create({
      code,
      projectId: dto.projectId ?? null,
      contractId: dto.contractId ?? null,
      siteAddress: dto.siteAddress,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      safetyBriefing: dto.safetyBriefing ?? null,
      status: 'draft' as InstallPlanStatus,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.planRepo.save(plan);
  }

  async update(id: string, dto: UpdateInstallPlanDto, userId: string): Promise<InstallPlan> {
    const plan = await this.findOne(id);
    if (plan.status !== 'draft' && plan.status !== 'submitted') {
      throw new BadRequestException('只有草稿或已提交状态才能编辑');
    }
    Object.assign(plan, dto, {
      startDate: dto.startDate ? new Date(dto.startDate) : plan.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : plan.endDate,
      updatedBy: userId,
    });
    return this.planRepo.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    if (plan.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.planRepo.remove(plan);
  }

  async changeStatus(id: string, status: InstallPlanStatus, userId: string): Promise<InstallPlan> {
    const plan = await this.findOne(id);
    const validTransitions: Record<string, InstallPlanStatus[]> = {
      draft: ['submitted'],
      submitted: ['in_progress', 'draft'],
      in_progress: ['completed', 'cancelled'],
      completed: ['cancelled'],
      cancelled: [],
    };
    const allowed = validTransitions[plan.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`不允许从 ${plan.status} 变更为 ${status}`);
    }
    plan.status = status;
    plan.updatedBy = userId;
    return this.planRepo.save(plan);
  }
}
