import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShelfType } from './shelf-type.entity';
import { Specification } from '../specifications/specification.entity';
import { CreateShelfTypeDto, UpdateShelfTypeDto } from './dto/shelf-type.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ShelfTypeService {
  constructor(
    @InjectRepository(ShelfType)
    private readonly shelfTypeRepo: Repository<ShelfType>,
    @InjectRepository(Specification)
    private readonly specRepo: Repository<Specification>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.shelfTypeRepo.createQueryBuilder('st');
    if (keyword) {
      qb.andWhere('(st.name LIKE :kw OR st.code LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('st.status = :status', { status });
    if (sortBy) qb.orderBy(`st.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('st.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<ShelfType> {
    const st = await this.shelfTypeRepo.findOne({ where: { id } });
    if (!st) throw new NotFoundException(`货架类型 ${id} 不存在`);
    return st;
  }

  async create(dto: CreateShelfTypeDto, userId: string): Promise<ShelfType> {
    const existing = await this.shelfTypeRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`编码 ${dto.code} 已存在`);
    const st = this.shelfTypeRepo.create({ ...dto, createdBy: userId, updatedBy: userId });
    return this.shelfTypeRepo.save(st);
  }

  async update(id: string, dto: UpdateShelfTypeDto, userId: string): Promise<ShelfType> {
    const st = await this.findOne(id);
    if (dto.code && dto.code !== st.code) {
      const existing = await this.shelfTypeRepo.findOne({ where: { code: dto.code } });
      if (existing) throw new ConflictException(`编码 ${dto.code} 已存在`);
    }
    Object.assign(st, dto, { updatedBy: userId });
    return this.shelfTypeRepo.save(st);
  }

  async remove(id: string): Promise<void> {
    const st = await this.findOne(id);
    await this.shelfTypeRepo.remove(st);
  }

  async findSpecifications(shelfTypeId: string): Promise<Specification[]> {
    return this.specRepo.find({ where: { shelfTypeId }, order: { createdAt: 'DESC' } });
  }
}
