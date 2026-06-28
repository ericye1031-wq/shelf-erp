import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from './dashboard.entity';
import { CreateDashboardDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Dashboard)
    private readonly repo: Repository<Dashboard>,
  ) {}

  async findAll(query: any): Promise<{ data: Dashboard[]; total: number }> {
    const { name, type, isPublic, createdBy, page = 1, pageSize = 10 } = query;
    const qb = this.repo.createQueryBuilder('d');
    if (name) qb.andWhere('d.name LIKE :name', { name: `%${name}%` });
    if (type) qb.andWhere('d.type = :type', { type });
    if (isPublic !== undefined) qb.andWhere('d.isPublic = :isPublic', { isPublic });
    if (createdBy) qb.andWhere('d.createdBy = :createdBy', { createdBy });
    qb.orderBy('d.createdAt', 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Dashboard | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateDashboardDto): Promise<Dashboard> {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity) as unknown as Promise<Dashboard>;
  }

  async update(id: number, dto: any): Promise<Dashboard | null> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
