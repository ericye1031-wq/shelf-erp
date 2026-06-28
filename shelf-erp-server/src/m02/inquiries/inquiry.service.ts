import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from './inquiry.entity';
import { Customer } from '../customers/customer.entity';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepo: Repository<Inquiry>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.inquiryRepo.createQueryBuilder('i');
    if (keyword) {
      qb.andWhere('(i.code LIKE :kw OR i.customerName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('i.status = :status', { status });
    if (sortBy) qb.orderBy(`i.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('i.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepo.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException(`询价单 ${id} 不存在`);
    return inquiry;
  }

  async create(dto: CreateInquiryDto, userId: string): Promise<Inquiry> {
    const customer = await this.customerRepo.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException(`客户 ${dto.customerId} 不存在`);

    // 生成单号
    const count = await this.inquiryRepo.count();
    const code = generateCode('inquiry', count + 1);

    const inquiry = this.inquiryRepo.create({
      code,
      customerId: dto.customerId,
      customerName: customer.name,
      opportunityId: dto.opportunityId ?? null,
      shelfType: dto.shelfType,
      requirement: dto.requirement,
      quantity: dto.quantity,
      unit: dto.unit,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.inquiryRepo.save(inquiry);
  }

  async update(id: string, dto: UpdateInquiryDto, userId: string): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    Object.assign(inquiry, dto, {
      updatedBy: userId,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : inquiry.deliveryDate,
    });
    return this.inquiryRepo.save(inquiry);
  }

  async remove(id: string): Promise<void> {
    const inquiry = await this.findOne(id);
    await this.inquiryRepo.remove(inquiry);
  }
}
