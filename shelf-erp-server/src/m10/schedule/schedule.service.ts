import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleItem } from './schedule.entity';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleItem)
    private readonly repo: Repository<ScheduleItem>,
  ) {}

  async findAll(dto: PaginationDto & { workOrderId?: string; equipmentId?: string }) {
    const { page = 1, pageSize = 20, status, workOrderId, equipmentId } = dto;
    const qb = this.repo.createQueryBuilder('sch');
    if (workOrderId) qb.andWhere('sch.workOrderId = :woId', { woId: workOrderId });
    if (equipmentId) qb.andWhere('sch.equipmentId = :eqId', { eqId: equipmentId });
    if (status) qb.andWhere('sch.status = :status', { status });
    qb.orderBy('sch.startTime', 'ASC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async update(id: string, data: Partial<ScheduleItem>): Promise<ScheduleItem> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`排程 ${id} 不存在`);
    Object.assign(item, {
      equipmentId: data.equipmentId ?? item.equipmentId,
      equipmentName: data.equipmentName ?? item.equipmentName,
      startTime: data.startTime ? new Date(data.startTime) : item.startTime,
      endTime: data.endTime ? new Date(data.endTime) : item.endTime,
      status: data.status ?? item.status,
    });
    return this.repo.save(item);
  }
}
