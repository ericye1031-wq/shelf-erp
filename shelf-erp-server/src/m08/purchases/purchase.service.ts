import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseStatus } from './purchase-order.entity';
import { PurchaseItem } from './purchase-item.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseItemDto } from './dto/purchase.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseItem)
    private readonly itemRepo: Repository<PurchaseItem>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.purchaseRepo.createQueryBuilder('po');
    if (keyword) {
      qb.andWhere('(po.code LIKE :kw OR po.supplierName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('po.status = :status', { status });
    if (sortBy) qb.orderBy(`po.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('po.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException(`采购单 ${id} 不存在`);
    return order;
  }

  async create(dto: CreatePurchaseOrderDto, userId: string): Promise<PurchaseOrder> {
    const code = generateCode('batch', 1);
    const order = this.purchaseRepo.create({
      code,
      projectId: dto.projectId ?? null,
      supplierId: dto.supplierId ?? null,
      supplierName: dto.supplierName,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
      status: 'draft',
      remark: dto.remark,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.purchaseRepo.save(order);
  }

  async update(id: string, dto: UpdatePurchaseOrderDto, userId: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    if (order.status !== 'draft') throw new BadRequestException('只有草稿状态才能编辑');
    Object.assign(order, dto, {
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : order.expectedDate,
      updatedBy: userId,
    });
    return this.purchaseRepo.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    if (order.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.purchaseRepo.remove(order);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: PurchaseStatus, userId: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    const validTransitions: Record<string, PurchaseStatus[]> = {
      draft: ['submitted'],
      submitted: ['approved', 'draft'],
      approved: ['ordered'],
      ordered: ['partial_received', 'received', 'cancelled'],
      partial_received: ['received'],
    };
    const allowed = validTransitions[order.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${order.status} 变更为 ${status}`);
    
    // 采购单入库时，自动创建库存记录
    if (status === 'received' || status === 'partial_received') {
      // TODO: 调用M11仓储Service创建入库记录
      // 这里先预留逻辑，等事件驱动实现后补充
    }
    
    // 采购单完成时，更新项目状态（如果有关联项目）
    if (status === 'received' && order.projectId) {
      // TODO: 调用M07项目Service更新项目进度
    }
    
    order.status = status;
    order.updatedBy = userId;
    return this.purchaseRepo.save(order);
  }

  // ---- 采购明细 ----
  async getItems(orderId: string): Promise<PurchaseItem[]> {
    await this.findOne(orderId);
    return this.itemRepo.find({ where: { purchaseOrderId: orderId }, order: { sortOrder: 'ASC' } });
  }

  async setItems(orderId: string, items: PurchaseItemDto[]): Promise<PurchaseItem[]> {
    await this.findOne(orderId);
    await this.itemRepo.delete({ purchaseOrderId: orderId });

    const entities = items.map((item, index) =>
      this.itemRepo.create({
        purchaseOrderId: orderId,
        partCode: item.partCode,
        partName: item.partName,
        material: item.material,
        spec: item.spec,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice ?? 0,
        totalPrice: item.quantity * (item.unitPrice ?? 0),
        expectedDate: item.expectedDate ? new Date(item.expectedDate) : null,
        remark: item.remark,
        sortOrder: index,
      }),
    );
    const saved = await this.itemRepo.save(entities);

    // 更新采购单总金额
    const totalAmount = saved.reduce((sum, i) => sum + i.totalPrice, 0);
    await this.purchaseRepo.update(orderId, { amount: totalAmount });

    return saved;
  }
}
