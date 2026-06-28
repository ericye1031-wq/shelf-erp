import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SparePartUsage } from './spare-part-usage.entity';
import { CreateSparePartUsageDto, UpdateSparePartUsageDto } from './dto/spare-part-usage.dto';

@Injectable()
export class SparePartUsageService {
  constructor(
    @InjectRepository(SparePartUsage)
    private readonly repo: Repository<SparePartUsage>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, pageSize = 20, keyword, repairId, inventoryId } = query;
    const qb = this.repo.createQueryBuilder('s');

    if (keyword) {
      qb.andWhere('s.partName LIKE :kw OR s.partCode LIKE :kw', {
        kw: `%${keyword}%`,
      });
    }
    if (repairId) qb.andWhere('s.repairId = :repairId', { repairId });
    if (inventoryId) qb.andWhere('s.inventoryId = :inventoryId', { inventoryId });

    qb.orderBy('s.usedAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return { data: items, total, page, pageSize };
  }

  async findOne(id: string): Promise<SparePartUsage> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`备件使用记录 ${id} 不存在`);
    return entity;
  }

  async getByRepair(repairId: string): Promise<SparePartUsage[]> {
    return this.repo.find({
      where: { repairId },
      order: { usedAt: 'DESC' },
    });
  }

  async create(dto: CreateSparePartUsageDto): Promise<SparePartUsage> {
    const entity = new SparePartUsage();
    Object.assign(entity, {
      ...dto,
      totalCost: dto.quantity * dto.unitPrice,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateSparePartUsageDto): Promise<SparePartUsage> {
    const entity = await this.findOne(id);
    if (dto.quantity !== undefined) entity.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) entity.unitPrice = dto.unitPrice;
    if (dto.remark !== undefined) entity.remark = dto.remark;
    // Recalculate total cost when quantity or unitPrice changes
    if (dto.quantity !== undefined || dto.unitPrice !== undefined) {
      entity.totalCost = entity.quantity * entity.unitPrice;
    }
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
