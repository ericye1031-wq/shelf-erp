import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceivingInspection, InspectionResult, InspectionOverallResult } from './receiving-inspection.entity';
import { CreateReceivingInspectionDto, UpdateReceivingInspectionDto } from './dto/receiving-inspection.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class ReceivingInspectionService {
  constructor(
    @InjectRepository(ReceivingInspection)
    private readonly inspectionRepo: Repository<ReceivingInspection>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, sortBy, sortOrder } = dto;
    const qb = this.inspectionRepo.createQueryBuilder('ri');
    if (keyword) {
      qb.andWhere('(ri.inspectionNo LIKE :kw OR ri.purchaseOrderCode LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (sortBy) qb.orderBy(`ri.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ri.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<ReceivingInspection> {
    const inspection = await this.inspectionRepo.findOne({
      where: { id },
    });
    if (!inspection) throw new NotFoundException(`来料检验 ${id} 不存在`);
    return inspection;
  }

  async create(dto: CreateReceivingInspectionDto, userId: string): Promise<ReceivingInspection> {
    // 如果提供了检验单号，检查是否已存在
    if (dto.inspectionNo) {
      const existing = await this.inspectionRepo.findOne({ where: { inspectionNo: dto.inspectionNo } });
      if (existing) throw new BadRequestException(`检验单号 ${dto.inspectionNo} 已存在`);
    }

    // 生成检验单号（如果未提供）
    let inspectionNo = dto.inspectionNo;
    if (!inspectionNo) {
      const count = await this.inspectionRepo.count();
      inspectionNo = generateCode('inspection', count + 1);
    }

    const inspection = new ReceivingInspection();
    inspection.purchaseOrderId = dto.purchaseOrderId;
    inspection.purchaseOrderCode = dto.purchaseOrderCode;
    inspection.inspectionNo = inspectionNo;
    inspection.inspector = dto.inspector;
    inspection.inspectionDate = new Date(dto.inspectionDate);
    inspection.appearance = dto.appearance as InspectionResult;
    inspection.dimension = dto.dimension as InspectionResult;
    inspection.materialQuality = dto.materialQuality as InspectionResult;
    inspection.coating = dto.coating as InspectionResult;
    inspection.quantityCheck = dto.quantityCheck as InspectionResult;
    inspection.result = dto.result as InspectionOverallResult;
    inspection.defectDesc = dto.defectDesc ?? null;
    inspection.remark = dto.remark ?? null;
    inspection.createdBy = userId;
    inspection.updatedBy = userId;
    
    return this.inspectionRepo.save(inspection);
  }

  async update(id: string, dto: UpdateReceivingInspectionDto, userId: string): Promise<ReceivingInspection> {
    const inspection = await this.findOne(id);
    Object.assign(inspection, {
      inspector: dto.inspector ?? inspection.inspector,
      inspectionDate: dto.inspectionDate ? new Date(dto.inspectionDate) : inspection.inspectionDate,
      appearance: (dto.appearance as InspectionResult) ?? inspection.appearance,
      dimension: (dto.dimension as InspectionResult) ?? inspection.dimension,
      materialQuality: (dto.materialQuality as InspectionResult) ?? inspection.materialQuality,
      coating: (dto.coating as InspectionResult) ?? inspection.coating,
      quantityCheck: (dto.quantityCheck as InspectionResult) ?? inspection.quantityCheck,
      result: (dto.result as InspectionOverallResult) ?? inspection.result,
      defectDesc: dto.defectDesc ?? inspection.defectDesc,
      remark: dto.remark ?? inspection.remark,
    });
    return this.inspectionRepo.save(inspection);
  }

  async remove(id: string): Promise<void> {
    const inspection = await this.findOne(id);
    await this.inspectionRepo.remove(inspection);
  }
}
