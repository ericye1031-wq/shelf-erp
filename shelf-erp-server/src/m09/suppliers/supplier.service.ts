import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, SupplierStatus, SupplierRating } from './supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.supplierRepo.createQueryBuilder('s');
    if (keyword) {
      qb.andWhere('(s.code LIKE :kw OR s.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('s.status = :status', { status });
    if (sortBy) qb.orderBy(`s.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('s.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
    });
    if (!supplier) throw new NotFoundException(`供应商 ${id} 不存在`);
    return supplier;
  }

  async create(dto: CreateSupplierDto, userId: string): Promise<Supplier> {
    // 检查编码是否已存在
    const existing = await this.supplierRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`供应商编码 ${dto.code} 已存在`);

    const supplier = new Supplier();
    supplier.code = dto.code;
    supplier.name = dto.name;
    supplier.taxId = dto.taxId ?? null;
    supplier.supplyCategories = dto.supplyCategories ?? null;
    supplier.contactName = dto.contactName ?? null;
    supplier.contactPhone = dto.contactPhone ?? null;
    supplier.contactEmail = dto.contactEmail ?? null;
    supplier.bankAccount = dto.bankAccount ?? null;
    supplier.bankName = dto.bankName ?? null;
    supplier.rating = (dto.rating as SupplierRating) ?? 'C';
    supplier.status = (dto.status as SupplierStatus) ?? 'active';
    supplier.address = dto.address ?? null;
    supplier.remark = dto.remark ?? null;
    supplier.createdBy = userId;
    supplier.updatedBy = userId;
    
    return this.supplierRepo.save(supplier);
  }

  async update(id: string, dto: UpdateSupplierDto, userId: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, {
      name: dto.name ?? supplier.name,
      taxId: dto.taxId ?? supplier.taxId,
      supplyCategories: dto.supplyCategories ?? supplier.supplyCategories,
      contactName: dto.contactName ?? supplier.contactName,
      contactPhone: dto.contactPhone ?? supplier.contactPhone,
      contactEmail: dto.contactEmail ?? supplier.contactEmail,
      bankAccount: dto.bankAccount ?? supplier.bankAccount,
      bankName: dto.bankName ?? supplier.bankName,
      rating: (dto.rating as SupplierRating) ?? supplier.rating,
      status: (dto.status as SupplierStatus) ?? supplier.status,
      address: dto.address ?? supplier.address,
      remark: dto.remark ?? supplier.remark,
      updatedBy: userId,
    });
    return this.supplierRepo.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepo.remove(supplier);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: SupplierStatus, userId: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.status = status;
    supplier.updatedBy = userId;
    return this.supplierRepo.save(supplier);
  }
}
