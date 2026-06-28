import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRequisition, RequisitionUrgency, RequisitionStatus } from './purchase-requisition.entity';
import { CreatePurchaseRequisitionDto, UpdatePurchaseRequisitionDto } from './dto/purchase-requisition.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class PurchaseRequisitionService {
  constructor(
    @InjectRepository(PurchaseRequisition)
    private readonly requisitionRepo: Repository<PurchaseRequisition>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.requisitionRepo.createQueryBuilder('pr');
    if (keyword) {
      qb.andWhere('(pr.code LIKE :kw OR pr.materialName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('pr.status = :status', { status });
    if (sortBy) qb.orderBy(`pr.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('pr.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<PurchaseRequisition> {
    const requisition = await this.requisitionRepo.findOne({
      where: { id },
    });
    if (!requisition) throw new NotFoundException(`采购申请 ${id} 不存在`);
    return requisition;
  }

  async create(dto: CreatePurchaseRequisitionDto, userId: string): Promise<PurchaseRequisition> {
    // 生成采购申请单号
    const count = await this.requisitionRepo.count();
    const code = generateCode('requisition', count + 1);

    const requisition = new PurchaseRequisition();
    requisition.code = code;
    requisition.projectId = dto.projectId ?? null;
    requisition.materialCode = dto.materialCode;
    requisition.materialName = dto.materialName;
    requisition.spec = dto.spec ?? null;
    requisition.quantity = dto.quantity;
    requisition.unit = dto.unit ?? '个';
    requisition.demandDate = dto.demandDate ? new Date(dto.demandDate) : null;
    requisition.suggestedSupplierId = dto.suggestedSupplierId ?? null;
    requisition.urgency = (dto.urgency as RequisitionUrgency) ?? 'normal';
    requisition.status = 'draft';
    requisition.approvedBy = null;
    requisition.approvedAt = null;
    requisition.remark = dto.remark ?? null;
    requisition.createdBy = userId;
    requisition.updatedBy = userId;
    
    return this.requisitionRepo.save(requisition);
  }

  async update(id: string, dto: UpdatePurchaseRequisitionDto, userId: string): Promise<PurchaseRequisition> {
    const requisition = await this.findOne(id);
    if (requisition.status !== 'draft') throw new BadRequestException('只有草稿状态才能编辑');
    Object.assign(requisition, {
      projectId: dto.projectId ?? requisition.projectId,
      materialCode: dto.materialCode ?? requisition.materialCode,
      materialName: dto.materialName ?? requisition.materialName,
      spec: dto.spec ?? requisition.spec,
      quantity: dto.quantity ?? requisition.quantity,
      unit: dto.unit ?? requisition.unit,
      demandDate: dto.demandDate ? new Date(dto.demandDate) : requisition.demandDate,
      suggestedSupplierId: dto.suggestedSupplierId ?? requisition.suggestedSupplierId,
      urgency: (dto.urgency as RequisitionUrgency) ?? requisition.urgency,
      remark: dto.remark ?? requisition.remark,
      updatedBy: userId,
    });
    return this.requisitionRepo.save(requisition);
  }

  async remove(id: string): Promise<void> {
    const requisition = await this.findOne(id);
    if (requisition.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.requisitionRepo.remove(requisition);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: RequisitionStatus, userId: string): Promise<PurchaseRequisition> {
    const requisition = await this.findOne(id);
    const validTransitions: Record<string, RequisitionStatus[]> = {
      draft: ['submitted'],
      submitted: ['approved', 'draft'],
      approved: ['converted', 'cancelled'],
    };
    const allowed = validTransitions[requisition.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${requisition.status} 变更为 ${status}`);

    // 审批时记录审批人和审批时间
    if (status === 'approved') {
      requisition.approvedBy = userId;
      requisition.approvedAt = new Date();
    }

    // 采购申请转为采购单时，需要创建采购单
    if (status === 'converted') {
      // TODO: 调用 M08 采购Service创建采购单
    }

    requisition.status = status;
    requisition.updatedBy = userId;
    return this.requisitionRepo.save(requisition);
  }
}
