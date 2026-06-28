import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp } from './follow-up.entity';
import { Customer } from '../customers/customer.entity';
import { CreateFollowUpDto } from './dto/follow-up.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectRepository(FollowUp)
    private readonly fuRepo: Repository<FollowUp>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.fuRepo.createQueryBuilder('f');
    if (keyword) {
      qb.andWhere('f.content LIKE :kw', { kw: `%${keyword}%` });
    }
    if (sortBy) qb.orderBy(`f.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('f.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async create(dto: CreateFollowUpDto, userId: string): Promise<FollowUp> {
    const customer = await this.customerRepo.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException(`客户 ${dto.customerId} 不存在`);
    const fu = this.fuRepo.create({
      ...dto,
      nextDate: dto.nextDate ? new Date(dto.nextDate) : null,
      createdBy: userId,
    });
    return this.fuRepo.save(fu);
  }
}
