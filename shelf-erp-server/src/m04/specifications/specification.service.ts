import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specification, StructureNode } from './specification.entity';
import { ShelfType } from '../shelf-types/shelf-type.entity';
import { CreateSpecificationDto, UpdateSpecificationDto } from './dto/specification.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class SpecificationService {
  constructor(
    @InjectRepository(Specification)
    private readonly specRepo: Repository<Specification>,
    @InjectRepository(ShelfType)
    private readonly shelfTypeRepo: Repository<ShelfType>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, sortBy, sortOrder } = dto;
    const qb = this.specRepo.createQueryBuilder('s');
    if (keyword) {
      qb.andWhere('s.name LIKE :kw', { kw: `%${keyword}%` });
    }
    if (sortBy) qb.orderBy(`s.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('s.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Specification> {
    const spec = await this.specRepo.findOne({ where: { id } });
    if (!spec) throw new NotFoundException(`规格 ${id} 不存在`);
    return spec;
  }

  async create(dto: CreateSpecificationDto, userId: string): Promise<Specification> {
    const st = await this.shelfTypeRepo.findOne({ where: { id: dto.shelfTypeId } });
    if (!st) throw new NotFoundException(`货架类型 ${dto.shelfTypeId} 不存在`);
    const spec = this.specRepo.create({
      ...dto,
      structureTemplate: dto.structureTemplate as StructureNode[] | undefined,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.specRepo.save(spec);
  }

  async update(id: string, dto: UpdateSpecificationDto, userId: string): Promise<Specification> {
    const spec = await this.findOne(id);
    Object.assign(spec, dto, { updatedBy: userId });
    return this.specRepo.save(spec);
  }
}
