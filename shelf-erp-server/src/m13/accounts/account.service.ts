import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Account, AccountStatus, AccountCategory, BalanceDirection } from './account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async findAll(dto: PaginationDto & { parentId?: string }) {
    const { page = 1, pageSize = 20, keyword, status, parentId } = dto;
    const qb = this.accountRepo.createQueryBuilder('a');

    if (keyword) {
      qb.andWhere('(a.code LIKE :kw OR a.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('a.status = :status', { status });
    if (parentId !== undefined) {
      if (parentId === 'root' || parentId === 'null' || parentId === '') {
        qb.andWhere('a.parentId IS NULL');
      } else {
        qb.andWhere('a.parentId = :parentId', { parentId });
      }
    }
    qb.orderBy('a.code', 'ASC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findTree() {
    const all = await this.accountRepo.find({
      where: { status: 'active' },
      order: { code: 'ASC' },
    });
    return this.buildTree(all);
  }

  private buildTree(accounts: Account[]): any[] {
    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const a of accounts) {
      map.set(a.id, { ...a, children: [] });
    }
    for (const a of accounts) {
      const node = map.get(a.id);
      if (a.parentId && map.has(a.parentId)) {
        map.get(a.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`科目 ${id} 不存在`);
    return account;
  }

  async findChildren(parentId: string): Promise<Account[]> {
    return this.accountRepo.find({
      where: { parentId, status: 'active' },
      order: { code: 'ASC' },
    });
  }

  async create(dto: CreateAccountDto, userId: string): Promise<Account> {
    const existing = await this.accountRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`科目编码 ${dto.code} 已存在`);

    if (dto.parentId) {
      await this.findOne(dto.parentId);
    }

    const account = this.accountRepo.create({
      code: dto.code,
      name: dto.name,
      parentId: dto.parentId ?? null,
      category: dto.category as AccountCategory,
      balanceDirection: (dto.balanceDirection || 'debit') as BalanceDirection,
      isLeaf: dto.isLeaf ?? true,
      hasAux: dto.hasAux ?? false,
      auxTypes: dto.auxTypes ?? null,
      status: 'active' as AccountStatus,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.accountRepo.save(account);
  }

  async update(id: string, dto: UpdateAccountDto, userId: string): Promise<Account> {
    const account = await this.findOne(id);

    Object.assign(account, dto, { updatedBy: userId });
    return this.accountRepo.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);
    const children = await this.accountRepo.count({ where: { parentId: id } });
    if (children > 0) throw new BadRequestException('存在子科目，无法删除');
    await this.accountRepo.remove(account);
  }
}
