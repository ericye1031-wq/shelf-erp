import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnVisit } from './return-visit.entity';
import { CreateReturnVisitDto, UpdateReturnVisitDto } from './dto/return-visit.dto';

@Injectable()
export class ReturnVisitService {
  constructor(
    @InjectRepository(ReturnVisit)
    private readonly repo: Repository<ReturnVisit>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, pageSize = 20, keyword, status } = query;
    const qb = this.repo.createQueryBuilder('t');

    if (keyword) {
      qb.andWhere('t.customerName LIKE :kw OR t.visitNo LIKE :kw', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('t.status = :status', { status });

    qb.orderBy('t.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page -1) * pageSize)
      .take(pageSize)
      .getMany();
    return { data: items, total, page, pageSize };
  }

  async findOne(id: string): Promise<ReturnVisit> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`回访记录 ${id} 不存在`);
    return entity;
  }

  async create(dto: CreateReturnVisitDto): Promise<ReturnVisit> {
    const visitNo = `VIS${Date.now()}`;
    const entity = new ReturnVisit();
    Object.assign(entity, {
      ...dto,
      visitNo,
      status: 'pending',
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateReturnVisitDto): Promise<ReturnVisit> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
