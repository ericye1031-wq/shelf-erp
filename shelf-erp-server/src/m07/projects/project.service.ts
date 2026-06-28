import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { Milestone } from './milestone.entity';
import { Alert } from './alert.entity';
import { CreateProjectDto, UpdateProjectDto, CreateMilestoneDto, UpdateMilestoneDto } from './dto/project.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Milestone)
    private readonly milestoneRepo: Repository<Milestone>,
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.projectRepo.createQueryBuilder('p');
    if (keyword) {
      qb.andWhere('(p.code LIKE :kw OR p.name LIKE :kw OR p.customerName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('p.status = :status', { status });
    if (sortBy) qb.orderBy(`p.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('p.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['milestones', 'alerts'],
    });
    if (!project) throw new NotFoundException(`项目 ${id} 不存在`);
    return project;
  }

  async create(dto: CreateProjectDto, userId: string): Promise<Project> {
    const code = generateCode('project', 1);
    const project = this.projectRepo.create({
      code,
      name: dto.name,
      contractId: dto.contractId ?? null,
      customerId: dto.customerId ?? null,
      customerName: dto.customerName,
      managerId: dto.managerId ?? null,
      managerName: dto.managerName,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      progress: 0,
      status: 'planning',
      description: dto.description,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.projectRepo.save(project);
  }

  async update(id: string, dto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, dto, {
      startDate: dto.startDate ? new Date(dto.startDate) : project.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : project.endDate,
      progress: dto.progress !== undefined ? Math.min(100, Math.max(0, dto.progress)) : project.progress,
      updatedBy: userId,
    });
    
    // 如果进度被手动设置，自动更新状态
    if (dto.progress !== undefined) {
      if (dto.progress === 100 && project.status === 'in_progress') {
        project.status = 'completed';
      } else if (dto.progress > 0 && project.status === 'planning') {
        project.status = 'in_progress';
      }
    }
    
    return this.projectRepo.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    if (project.status !== 'planning') throw new BadRequestException('只有规划中状态才能删除');
    await this.projectRepo.remove(project);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: ProjectStatus, userId: string): Promise<Project> {
    const project = await this.findOne(id);
    const validTransitions: Record<string, ProjectStatus[]> = {
      planning: ['in_progress', 'cancelled'],
      in_progress: ['paused', 'completed'],
      paused: ['in_progress', 'cancelled'],
    };
    const allowed = validTransitions[project.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${project.status} 变更为 ${status}`);
    project.status = status;
    project.updatedBy = userId;
    return this.projectRepo.save(project);
  }

  // ---- 里程碑 ----
  async getMilestones(projectId: string): Promise<Milestone[]> {
    await this.findOne(projectId);
    return this.milestoneRepo.find({ where: { projectId }, order: { plannedDate: 'ASC' } });
  }

  async addMilestone(projectId: string, dto: CreateMilestoneDto, userId: string): Promise<Milestone> {
    await this.findOne(projectId);
    const milestone = this.milestoneRepo.create({
      projectId,
      name: dto.name,
      plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : null,
      description: dto.description,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.milestoneRepo.save(milestone);
    
    // 自动重新计算项目进度
    await this.recalculateProgress(projectId);
    
    return saved;
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto, userId: string): Promise<Milestone> {
    const milestone = await this.milestoneRepo.findOne({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException(`里程碑 ${milestoneId} 不存在`);
    Object.assign(milestone, dto, {
      actualDate: dto.actualDate ? new Date(dto.actualDate) : milestone.actualDate,
      updatedBy: userId,
    });
    return this.milestoneRepo.save(milestone);
  }

  // ---- 预警 ----
  async getAlerts(projectId: string): Promise<Alert[]> {
    await this.findOne(projectId);
    return this.alertRepo.find({ where: { projectId }, order: { triggeredAt: 'DESC' } });
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    const alert = await this.alertRepo.findOne({ where: { id: alertId } });
    if (!alert) throw new NotFoundException(`预警 ${alertId} 不存在`);
    alert.isRead = true;
    alert.resolvedAt = new Date();
    return this.alertRepo.save(alert);
  }

  /** 根据里程碑完成率重新计算项目进度 */
  private async recalculateProgress(projectId: string): Promise<void> {
    const milestones = await this.milestoneRepo.find({
      where: { projectId },
    });
    
    if (milestones.length === 0) return;
    
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const progress = Math.round((completedCount / milestones.length) * 100);
    
    await this.projectRepo.update(projectId, { progress });
  }
}
