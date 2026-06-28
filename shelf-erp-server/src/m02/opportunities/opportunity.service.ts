import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { Customer } from '../customers/customer.entity';
import { CreateOpportunityDto, UpdateOpportunityDto, UpdateStageDto } from './dto/opportunity.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class OpportunityService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly oppRepo: Repository<Opportunity>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.oppRepo.createQueryBuilder('o');
    if (keyword) {
      qb.andWhere('(o.title LIKE :kw OR o.customerName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('o.status = :status', { status });
    if (sortBy) qb.orderBy(`o.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('o.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Opportunity> {
    const opp = await this.oppRepo.findOne({ where: { id } });
    if (!opp) throw new NotFoundException(`商机 ${id} 不存在`);
    return opp;
  }

  async create(dto: CreateOpportunityDto, userId: string): Promise<Opportunity> {
    const customer = await this.customerRepo.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException(`客户 ${dto.customerId} 不存在`);
    const opp = this.oppRepo.create({
      ...dto,
      customerId: dto.customerId,
      customerName: customer.name,
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.oppRepo.save(opp);
  }

  async update(id: string, dto: UpdateOpportunityDto, userId: string): Promise<Opportunity> {
    const opp = await this.findOne(id);
    Object.assign(opp, dto, {
      updatedBy: userId,
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : opp.expectedDate,
    });
    return this.oppRepo.save(opp);
  }

  async updateStage(id: string, dto: UpdateStageDto, userId: string): Promise<Opportunity> {
    const opp = await this.findOne(id);
    opp.stage = dto.stage;
    if (dto.probability !== undefined) opp.probability = dto.probability;
    opp.updatedBy = userId;
    return this.oppRepo.save(opp);
  }

  async remove(id: string): Promise<void> {
    const opp = await this.findOne(id);
    await this.oppRepo.remove(opp);
  }
}
