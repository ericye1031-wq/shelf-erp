import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repair } from './repair.entity';
import { CreateRepairDto, UpdateRepairDto } from './dto/repair.dto';

/** 备件链接参数 */
export interface SparePartLink {
  inventoryId: string;
  partCode: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

/** 维修成本明细 */
export interface RepairCostDetail {
  repairId: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  partsUsed: SparePartLink[];
}

@Injectable()
export class RepairService {
  constructor(
    @InjectRepository(Repair)
    private readonly repo: Repository<Repair>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, pageSize = 20, keyword, status, ticketId, equipmentId } = query;
    const qb = this.repo.createQueryBuilder('t');

    if (keyword) {
      qb.andWhere('t.faultDesc LIKE :kw OR t.repairNo LIKE :kw', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('t.status = :status', { status });
    if (ticketId) qb.andWhere('t.ticketId = :ticketId', { ticketId });
    if (equipmentId) qb.andWhere('t.equipmentId = :equipmentId', { equipmentId });

    qb.orderBy('t.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return { data: items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Repair> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`维修记录 ${id} 不存在`);
    return entity;
  }

  async create(dto: CreateRepairDto): Promise<Repair> {
    const repairNo = `REP${Date.now()}`;
    const entity = new Repair();
    Object.assign(entity, {
      ...dto,
      repairNo,
      status: 'pending',
      laborCost: 0,
      partsCost: 0,
      repairCost: 0,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateRepairDto): Promise<Repair> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  /**
   * 关联备件到维修记录
   * 计算备件总成本并更新 partsCost 和 repairCost
   */
  async linkSpareParts(repairId: string, spareParts: SparePartLink[]): Promise<RepairCostDetail> {
    const entity = await this.findOne(repairId);

    const partsCost = spareParts.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0,
    );
    const laborCost = entity.laborCost ?? 0;
    const totalCost = laborCost + partsCost;

    entity.partsCost = partsCost;
    entity.repairCost = totalCost;
    entity.partsUsed = JSON.stringify(spareParts);
    await this.repo.save(entity);

    return {
      repairId,
      laborCost,
      partsCost,
      totalCost,
      partsUsed: spareParts,
    };
  }

  /**
   * 计算维修总成本 = 人工费 + 备件费
   */
  async calculateRepairCost(repairId: string): Promise<RepairCostDetail> {
    const entity = await this.findOne(repairId);

    const laborCost = entity.laborCost ?? 0;
    const partsCost = entity.partsCost ?? 0;
    const totalCost = laborCost + partsCost;

    // Auto-sync repairCost
    if (entity.repairCost !== totalCost) {
      entity.repairCost = totalCost;
      await this.repo.save(entity);
    }

    let partsUsed: SparePartLink[] = [];
    try {
      if (entity.partsUsed) {
        partsUsed = JSON.parse(entity.partsUsed);
      }
    } catch {
      partsUsed = [];
    }

    return {
      repairId,
      laborCost,
      partsCost,
      totalCost,
      partsUsed,
    };
  }

  /**
   * 获取项目的所有维修历史
   */
  async getRepairHistory(projectId: string): Promise<Repair[]> {
    return this.repo
      .createQueryBuilder('r')
      .leftJoin('m16_service_tickets', 'st', 'st.id = r.ticket_id')
      .where('st.project_id = :projectId', { projectId })
      .orderBy('r.createdAt', 'DESC')
      .getMany();
  }
}
