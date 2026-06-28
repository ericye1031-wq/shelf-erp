import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from './equipment.entity';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly repo: Repository<Equipment>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.repo.createQueryBuilder('eq');
    if (keyword) {
      qb.andWhere('(eq.name LIKE :kw OR eq.code LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('eq.status = :status', { status });
    if (sortBy) qb.orderBy(`eq.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('eq.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Equipment> {
    const eq = await this.repo.findOne({ where: { id } });
    if (!eq) throw new NotFoundException(`设备 ${id} 不存在`);
    return eq;
  }

  async update(id: string, data: Partial<Equipment>, userId: string): Promise<Equipment> {
    const eq = await this.findOne(id);
    Object.assign(eq, {
      name: data.name ?? eq.name,
      code: data.code ?? eq.code,
      type: data.type ?? eq.type,
      workshop: data.workshop ?? eq.workshop,
      status: data.status ?? eq.status,
      capacity: data.capacity ?? eq.capacity,
      currentLoad: data.currentLoad ?? eq.currentLoad,
      nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : eq.nextMaintenance,
      updatedBy: userId,
    });
    return this.repo.save(eq);
  }
}
