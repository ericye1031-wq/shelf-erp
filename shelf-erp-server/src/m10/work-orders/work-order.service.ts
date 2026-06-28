import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from './work-order.entity';
import { ProcessStep } from './process-step.entity';
import { CreateWorkOrderDto, UpdateWorkOrderDto, ProcessStepDto } from './dto/work-order.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly woRepo: Repository<WorkOrder>,
    @InjectRepository(ProcessStep)
    private readonly stepRepo: Repository<ProcessStep>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.woRepo.createQueryBuilder('wo');
    if (keyword) qb.andWhere('wo.code LIKE :kw', { kw: `%${keyword}%` });
    if (status) qb.andWhere('wo.status = :status', { status });
    if (sortBy) qb.orderBy(`wo.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('wo.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<WorkOrder> {
    const wo = await this.woRepo.findOne({ where: { id }, relations: ['processSteps'] });
    if (!wo) throw new NotFoundException(`工单 ${id} 不存在`);
    return wo;
  }

  async create(dto: CreateWorkOrderDto, userId: string): Promise<WorkOrder> {
    const code = generateCode('workOrder', 1);
    const wo = this.woRepo.create({
      code,
      projectId: dto.projectId ?? null,
      bomId: dto.bomId ?? null,
      shelfConfigId: dto.shelfConfigId ?? null,
      quantity: dto.quantity,
      priority: (dto.priority as WorkOrder['priority']) ?? 'normal',
      plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : null,
      plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : null,
      status: 'pending',
      remark: dto.remark,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.woRepo.save(wo);
  }

  async update(id: string, dto: UpdateWorkOrderDto, userId: string): Promise<WorkOrder> {
    const wo = await this.findOne(id);
    if (wo.status !== 'pending') throw new BadRequestException('只有待排产状态才能编辑');
    Object.assign(wo, dto, {
      plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : wo.plannedStart,
      plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : wo.plannedEnd,
      updatedBy: userId,
    });
    return this.woRepo.save(wo);
  }

  async changeStatus(id: string, status: WorkOrderStatus, userId: string): Promise<WorkOrder> {
    const wo = await this.findOne(id);
    const validTransitions: Record<string, WorkOrderStatus[]> = {
      pending: ['released'],
      released: ['in_progress'],
      in_progress: ['completed'],
      completed: ['closed'],
    };
    const allowed = validTransitions[wo.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${wo.status} 变更为 ${status}`);
    
    // 工单完成时，自动核算成本
    if (status === 'completed' && wo.projectId) {
      // TODO: 调用M12成本Service，根据BOM和实际用量核算成本
      // 这里先预留逻辑，等事件驱动实现后补充
    }
    
    wo.status = status;
    wo.updatedBy = userId;
    if (status === 'in_progress' && !wo.actualStart) wo.actualStart = new Date();
    if (status === 'completed' && !wo.actualEnd) wo.actualEnd = new Date();
    return this.woRepo.save(wo);
  }

  // ---- 工序 ----
  async getProcessSteps(woId: string): Promise<ProcessStep[]> {
    await this.findOne(woId);
    return this.stepRepo.find({ where: { workOrderId: woId }, order: { sequence: 'ASC' } });
  }

  async setProcessSteps(woId: string, steps: ProcessStepDto[]): Promise<ProcessStep[]> {
    await this.findOne(woId);
    await this.stepRepo.delete({ workOrderId: woId });
    const entities = steps.map((s, i) =>
      this.stepRepo.create({
        workOrderId: woId,
        stepCode: s.stepCode,
        stepName: s.stepName,
        sequence: s.sequence ?? i + 1,
        equipmentName: s.equipmentName,
        plannedMinutes: s.plannedMinutes,
        status: 'pending',
      }),
    );
    return this.stepRepo.save(entities);
  }

  async updateStepStatus(stepId: string, status: string): Promise<ProcessStep> {
    const step = await this.stepRepo.findOne({ where: { id: stepId } });
    if (!step) throw new NotFoundException(`工序 ${stepId} 不存在`);
    step.status = status as ProcessStep['status'];
    if (status === 'in_progress' && !step.startedAt) step.startedAt = new Date();
    if (status === 'completed' && !step.completedAt) step.completedAt = new Date();
    return this.stepRepo.save(step);
  }
}
