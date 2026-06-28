import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currency.entity';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20 } = dto;
    const [items, total] = await this.currencyRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { code: 'ASC' },
    });
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyRepo.findOne({ where: { id } });
    if (!currency) throw new NotFoundException(`币种 ${id} 不存在`);
    return currency;
  }

  async create(dto: CreateCurrencyDto): Promise<Currency> {
    const currency = this.currencyRepo.create(dto);
    return this.currencyRepo.save(currency);
  }

  async update(id: string, dto: UpdateCurrencyDto): Promise<Currency> {
    const currency = await this.findOne(id);
    Object.assign(currency, dto);
    return this.currencyRepo.save(currency);
  }

  async remove(id: string): Promise<void> {
    const currency = await this.findOne(id);
    await this.currencyRepo.remove(currency);
  }
}
