import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KPI } from './kpi.entity';
import { CreateKpiDto } from './dto/kpi.dto';

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(KPI)
    private readonly repo: Repository<KPI>,
  ) {}

  async findAll(query: any): Promise<{ data: KPI[]; total: number }> {
    const { name, type, unit, trend, isActive, createdBy, page = 1, pageSize = 10 } = query;
    const qb = this.repo.createQueryBuilder('k');
    if (name) qb.andWhere('k.name LIKE :name', { name: `%${name}%` });
    if (type) qb.andWhere('k.type = :type', { type });
    if (unit) qb.andWhere('k.unit = :unit', { unit });
    if (trend) qb.andWhere('k.trend = :trend', { trend });
    if (isActive !== undefined) qb.andWhere('k.isActive = :isActive', { isActive });
    if (createdBy) qb.andWhere('k.createdBy = :createdBy', { createdBy });
    qb.orderBy('k.createdAt', 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<KPI | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateKpiDto): Promise<KPI> {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity) as unknown as Promise<KPI>;
  }

  async update(id: number, dto: any): Promise<KPI | null> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
