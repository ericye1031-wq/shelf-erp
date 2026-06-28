import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection } from './inspection.entity';
import { CreateInspectionDto, UpdateInspectionDto } from './dto/inspection.dto';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly repo: Repository<Inspection>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, pageSize = 20, keyword, status, result } = query;
    const qb = this.repo.createQueryBuilder('t');

    if (keyword) {
      qb.andWhere('t.title LIKE :kw OR t.inspectionNo LIKE :kw', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('t.status = :status', { status });
    if (result) qb.andWhere('t.result = :result', { result });

    qb.orderBy('t.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return { data: items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Inspection> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`巡检记录 ${id} 不存在`);
    return entity;
  }

  async create(dto: CreateInspectionDto): Promise<Inspection> {
    const inspectionNo = `INS${Date.now()}`;
    const entity = new Inspection();
    Object.assign(entity, {
      ...dto,
      inspectionNo,
      status: 'pending',
      result: 'pending',
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateInspectionDto): Promise<Inspection> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
