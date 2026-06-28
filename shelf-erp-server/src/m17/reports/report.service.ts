import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly repo: Repository<Report>,
  ) {}

  async findAll(query: any): Promise<{ data: Report[]; total: number }> {
    const { name, type, format, isPublic, isActive, createdBy, page = 1, pageSize = 10 } = query;
    const qb = this.repo.createQueryBuilder('r');
    if (name) qb.andWhere('r.name LIKE :name', { name: `%${name}%` });
    if (type) qb.andWhere('r.type = :type', { type });
    if (format) qb.andWhere('r.format = :format', { format });
    if (isPublic !== undefined) qb.andWhere('r.isPublic = :isPublic', { isPublic });
    if (isActive !== undefined) qb.andWhere('r.isActive = :isActive', { isActive });
    if (createdBy) qb.andWhere('r.createdBy = :createdBy', { createdBy });
    qb.orderBy('r.createdAt', 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Report | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateReportDto): Promise<Report> {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity) as unknown as Promise<Report>;
  }

  async update(id: number, dto: any): Promise<Report | null> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
