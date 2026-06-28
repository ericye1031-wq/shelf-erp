import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount, AccountType } from './bank-account.entity';
import { BankTransaction } from './bank-transaction.entity';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  CreateBankTransactionDto,
} from './dto/bank-account.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly accountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private readonly txRepo: Repository<BankTransaction>,
  ) {}

  // ---- 银行账户 ----

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, sortBy, sortOrder, ...rest } = dto;
    const qb = this.accountRepo.createQueryBuilder('ba');

    if (keyword) {
      qb.andWhere('(ba.name LIKE :kw OR ba.accountNo LIKE :kw OR ba.bankName LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (sortBy) qb.orderBy(`ba.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ba.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<BankAccount> {
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`银行账户 ${id} 不存在`);
    return account;
  }

  async create(dto: CreateBankAccountDto, userId: string): Promise<BankAccount> {
    const account = this.accountRepo.create({
      name: dto.name,
      accountNo: dto.accountNo,
      bankName: dto.bankName,
      branchName: dto.branchName ?? null,
      currency: dto.currency || 'CNY',
      balance: dto.balance || 0,
      accountType: (dto.accountType || 'bank') as AccountType,
      active: true,
      remark: dto.remark ?? null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.accountRepo.save(account);
  }

  async update(id: string, dto: UpdateBankAccountDto, userId: string): Promise<BankAccount> {
    const account = await this.findOne(id);
    Object.assign(account, dto, { updatedBy: userId });
    return this.accountRepo.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);
    await this.accountRepo.remove(account);
  }

  // ---- 流水 ----

  async addTransaction(dto: CreateBankTransactionDto, userId: string): Promise<BankTransaction> {
    const account = await this.findOne(dto.bankAccountId);

    if (dto.direction === 'in') {
      account.balance = Number(account.balance) + Number(dto.amount);
    } else {
      if (Number(account.balance) < Number(dto.amount)) {
        throw new BadRequestException(`余额不足，当前余额 ${account.balance}`);
      }
      account.balance = Number(account.balance) - Number(dto.amount);
    }
    account.updatedBy = userId;
    await this.accountRepo.save(account);

    const tx = this.txRepo.create({
      bankAccountId: dto.bankAccountId,
      transactionDate: new Date(dto.transactionDate),
      description: dto.description,
      direction: dto.direction as any,
      amount: dto.amount,
      balanceAfter: account.balance,
      referenceNo: dto.referenceNo ?? null,
      remark: dto.remark ?? null,
      createdBy: userId,
    });
    return this.txRepo.save(tx);
  }

  async getTransactions(
    bankAccountId: string,
    dto: PaginationDto & { startDate?: string; endDate?: string; direction?: string },
  ) {
    const { page = 1, pageSize = 20, startDate, endDate, direction, sortBy, sortOrder, ...rest } = dto;
    const qb = this.txRepo.createQueryBuilder('bt').where('bt.bankAccountId = :bankAccountId', {
      bankAccountId,
    });

    if (startDate) qb.andWhere('bt.transactionDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('bt.transactionDate <= :endDate', { endDate });
    if (direction) qb.andWhere('bt.direction = :direction', { direction });

    qb.orderBy('bt.transactionDate', 'DESC').addOrderBy('bt.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }
}
