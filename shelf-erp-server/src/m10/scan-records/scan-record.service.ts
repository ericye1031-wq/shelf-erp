import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanRecord } from './scan-record.entity';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ScanRecordService {
  constructor(
    @InjectRepository(ScanRecord)
    private readonly repo: Repository<ScanRecord>,
  ) {}

  async findAll(dto: PaginationDto & { workOrderId?: string; type?: string }) {
    const { page = 1, pageSize = 20, workOrderId, type } = dto;
    const qb = this.repo.createQueryBuilder('sr');
    if (workOrderId) qb.andWhere('sr.workOrderId = :woId', { woId: workOrderId });
    if (type) qb.andWhere('sr.type = :type', { type });
    qb.orderBy('sr.scannedAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async create(data: Partial<ScanRecord>): Promise<ScanRecord> {
    const record = this.repo.create({
      workOrderId: data.workOrderId,
      processStepId: data.processStepId,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      type: data.type,
      quantity: data.quantity ?? 0,
      defectQty: data.defectQty ?? 0,
      scannedAt: data.scannedAt ? new Date(data.scannedAt) : new Date(),
      remark: data.remark,
    });
    return this.repo.save(record);
  }
}
