import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityCheck } from './quality-check.entity';
import { Defect } from './defect.entity';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class QualityCheckService {
  constructor(
    @InjectRepository(QualityCheck)
    private readonly qcRepo: Repository<QualityCheck>,
    @InjectRepository(Defect)
    private readonly defectRepo: Repository<Defect>,
  ) {}

  async findAll(dto: PaginationDto & { workOrderId?: string }) {
    const { page = 1, pageSize = 20, workOrderId, status } = dto;
    const qb = this.qcRepo.createQueryBuilder('qc');
    if (workOrderId) qb.andWhere('qc.workOrderId = :woId', { woId: workOrderId });
    if (status) qb.andWhere('qc.result = :status', { status });
    qb.orderBy('qc.checkedAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async create(data: Partial<QualityCheck> & { defects?: Partial<Defect>[] }): Promise<QualityCheck> {
    const qc = this.qcRepo.create({
      workOrderId: data.workOrderId,
      processStepId: data.processStepId,
      inspectorId: data.inspectorId,
      inspectorName: data.inspectorName,
      type: data.type,
      result: data.result,
      checkedAt: data.checkedAt ? new Date(data.checkedAt) : new Date(),
      remark: data.remark,
    });
    const saved = await this.qcRepo.save(qc);

    // 创建关联的缺陷记录
    if (data.defects && data.defects.length > 0) {
      const defectEntities = data.defects.map((d) =>
        this.defectRepo.create({
          workOrderId: data.workOrderId,
          processStepId: data.processStepId,
          qualityCheckId: saved.id,
          type: d.type,
          severity: d.severity,
          quantity: d.quantity ?? 1,
          description: d.description,
          reportedAt: new Date(),
          reporterName: data.inspectorName,
          status: 'open',
          resolved: false,
        }),
      );
      await this.defectRepo.save(defectEntities);
    }

    return saved;
  }

  async getDefects(workOrderId: string): Promise<Defect[]> {
    return this.defectRepo.find({ where: { workOrderId }, order: { reportedAt: 'DESC' } });
  }
}
