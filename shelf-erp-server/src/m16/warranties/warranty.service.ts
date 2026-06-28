import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warranty } from './warranty.entity';
import { CreateWarrantyDto, UpdateWarrantyDto } from './dto/warranty.dto';

@Injectable()
export class WarrantyService {
  constructor(
    @InjectRepository(Warranty)
    private readonly repo: Repository<Warranty>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, pageSize = 20, keyword, status } = query;
    const qb = this.repo.createQueryBuilder('t');

    if (keyword) {
      qb.andWhere('t.productName LIKE :kw OR t.warrantyNo LIKE :kw', { kw: `%${keyword}%` });
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

  async findOne(id: string): Promise<Warranty> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`质保记录 ${id} 不存在`);
    return entity;
  }

  async create(dto: CreateWarrantyDto): Promise<Warranty> {
    const warrantyNo = `WAR${Date.now()}`;
    const entity = new Warranty();
    Object.assign(entity, {
      ...dto,
      warrantyNo,
      status: 'active',
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateWarrantyDto): Promise<Warranty> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
