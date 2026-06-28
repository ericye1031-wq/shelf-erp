import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { equal } from 'mathjs';
import { Voucher, VoucherStatus } from './voucher.entity';
import { VoucherEntry } from './voucher-entry.entity';
import { CreateVoucherDto, UpdateVoucherDto } from './dto/voucher.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    @InjectRepository(VoucherEntry)
    private readonly entryRepo: Repository<VoucherEntry>,
  ) {}

  async findAll(dto: PaginationDto & { voucherDate?: string; status?: string }) {
    const { page = 1, pageSize = 20, keyword, status, voucherDate, sortBy, sortOrder } = dto;
    const qb = this.voucherRepo.createQueryBuilder('v');

    if (keyword) {
      qb.andWhere('(v.voucherNo LIKE :kw OR v.remark LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('v.status = :status', { status });
    if (voucherDate) qb.andWhere('v.voucherDate = :voucherDate', { voucherDate });

    if (sortBy) qb.orderBy(`v.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('v.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.voucherRepo.findOne({
      where: { id },
      relations: ['entries'],
    });
    if (!voucher) throw new NotFoundException(`凭证 ${id} 不存在`);
    return voucher;
  }

  private validateBalance(entries: { debitAmount?: number; creditAmount?: number }[]) {
    const debitSum = entries.reduce((s, e) => s + (Number(e.debitAmount) || 0), 0);
    const creditSum = entries.reduce((s, e) => s + (Number(e.creditAmount) || 0), 0);
    if (!equal(debitSum, creditSum)) {
      throw new BadRequestException(`借贷不平衡：借方 ${debitSum.toFixed(2)} ≠ 贷方 ${creditSum.toFixed(2)}`);
    }
    return { debitSum: Math.round(debitSum * 100) / 100, creditSum: Math.round(creditSum * 100) / 100 };
  }

  async create(dto: CreateVoucherDto, userId: string): Promise<Voucher> {
    if (!dto.entries || dto.entries.length === 0) {
      throw new BadRequestException('至少需要一条分录');
    }

    const { debitSum, creditSum } = this.validateBalance(dto.entries);

    // 生成凭证号
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.voucherRepo
      .createQueryBuilder('v')
      .where('v.voucherNo LIKE :prefix', { prefix: `VOU${todayStr}%` })
      .getCount();
    const voucherNo = generateCode('voucher', count + 1, today);

    const voucher = this.voucherRepo.create({
      voucherNo,
      voucherDate: new Date(dto.voucherDate),
      attachmentCount: dto.attachmentCount ?? 0,
      totalDebit: debitSum,
      totalCredit: creditSum,
      status: 'draft',
      remark: dto.remark ?? null,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.voucherRepo.save(voucher);

    // 保存分录
    const entries = dto.entries.map((e, i) =>
      this.entryRepo.create({
        voucherId: saved.id,
        accountId: e.accountId,
        summary: e.summary || '',
        debitAmount: e.debitAmount ?? 0,
        creditAmount: e.creditAmount ?? 0,
        auxData: e.auxData ?? null,
        sortOrder: e.sortOrder ?? i,
      }),
    );
    saved.entries = await this.entryRepo.save(entries);
    return saved;
  }

  async update(id: string, dto: UpdateVoucherDto, userId: string): Promise<Voucher> {
    const voucher = await this.findOne(id);
    if (voucher.status !== 'draft') {
      throw new BadRequestException('只有草稿状态的凭证才能编辑');
    }

    if (dto.voucherDate) voucher.voucherDate = new Date(dto.voucherDate);
    if (dto.attachmentCount !== undefined) voucher.attachmentCount = dto.attachmentCount;
    if (dto.remark !== undefined) voucher.remark = dto.remark;
    voucher.updatedBy = userId;

    if (dto.entries) {
      const { debitSum, creditSum } = this.validateBalance(dto.entries);
      voucher.totalDebit = debitSum;
      voucher.totalCredit = creditSum;

      // 删除旧分录，保存新分录
      await this.entryRepo.delete({ voucherId: id });
      const entries = dto.entries.map((e, i) =>
        this.entryRepo.create({
          voucherId: id,
          accountId: e.accountId,
          summary: e.summary || '',
          debitAmount: e.debitAmount ?? 0,
          creditAmount: e.creditAmount ?? 0,
          auxData: e.auxData ?? null,
          sortOrder: e.sortOrder ?? i,
        }),
      );
      voucher.entries = await this.entryRepo.save(entries);
    }

    return this.voucherRepo.save(voucher);
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.findOne(id);
    if (voucher.status !== 'draft') {
      throw new BadRequestException('只有草稿状态的凭证才能删除');
    }
    await this.entryRepo.delete({ voucherId: id });
    await this.voucherRepo.remove(voucher);
  }

  /** 提交审核 */
  async submit(id: string, userId: string): Promise<Voucher> {
    const voucher = await this.findOne(id);
    if (voucher.status !== 'draft') {
      throw new BadRequestException('只有草稿状态才能提交审核');
    }
    if (!voucher.entries || voucher.entries.length === 0) {
      throw new BadRequestException('凭证无分录，无法提交');
    }
    voucher.status = 'submitted';
    voucher.updatedBy = userId;
    return this.voucherRepo.save(voucher);
  }

  /** 审核 */
  async audit(id: string, userId: string): Promise<Voucher> {
    const voucher = await this.findOne(id);
    if (voucher.status !== 'submitted') {
      throw new BadRequestException('只有已提交状态的凭证才能审核');
    }
    voucher.status = 'audited';
    voucher.updatedBy = userId;
    return this.voucherRepo.save(voucher);
  }

  /** 过账 */
  async post(id: string, userId: string): Promise<Voucher> {
    const voucher = await this.findOne(id);
    if (voucher.status !== 'audited') {
      throw new BadRequestException('只有已审核的凭证才能过账');
    }
    voucher.status = 'posted';
    voucher.postedBy = userId;
    voucher.postedAt = new Date();
    voucher.updatedBy = userId;
    return this.voucherRepo.save(voucher);
  }

  /** 红字冲销 */
  async reverse(id: string, userId: string): Promise<Voucher> {
    const original = await this.findOne(id);
    if (original.status !== 'posted') {
      throw new BadRequestException('只能冲销已过账的凭证');
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.voucherRepo
      .createQueryBuilder('v')
      .where('v.voucherNo LIKE :prefix', { prefix: `VOU${todayStr}%` })
      .getCount();

    const reversedVoucher = this.voucherRepo.create({
      voucherNo: generateCode('voucher', count + 1, today),
      voucherDate: today,
      attachmentCount: 0,
      totalDebit: original.totalDebit,
      totalCredit: original.totalCredit,
      status: 'draft',
      remark: `红字冲销 ${original.voucherNo}`,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.voucherRepo.save(reversedVoucher);

    // 分录借贷互换
    const reversedEntries = original.entries.map((e, i) =>
      this.entryRepo.create({
        voucherId: saved.id,
        accountId: e.accountId,
        summary: `冲销: ${e.summary || ''}`,
        debitAmount: e.creditAmount,   // 借变贷
        creditAmount: e.debitAmount,   // 贷变借
        auxData: e.auxData,
        sortOrder: i,
      }),
    );
    saved.entries = await this.entryRepo.save(reversedEntries);
    return saved;
  }

  /** 取消 */
  async cancel(id: string, userId: string): Promise<Voucher> {
    const voucher = await this.findOne(id);
    if (voucher.status === 'posted' || voucher.status === 'cancelled') {
      throw new BadRequestException('已过账或已取消的凭证不能取消');
    }
    voucher.status = 'cancelled';
    voucher.updatedBy = userId;
    return this.voucherRepo.save(voucher);
  }

  /** 获取分录 */
  async getEntries(voucherId: string): Promise<VoucherEntry[]> {
    return this.entryRepo.find({
      where: { voucherId },
      order: { sortOrder: 'ASC' },
    });
  }
}
