import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsReceivable, ReceivableStatus } from './receivable.entity';
import { Receipt } from './receipt.entity';
import { CreateReceivableDto, CreateReceiptDto } from './dto/receivable.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';
import dayjs from 'dayjs';

@Injectable()
export class ReceivableService {
  constructor(
    @InjectRepository(AccountsReceivable)
    private readonly receivableRepo: Repository<AccountsReceivable>,
    @InjectRepository(Receipt)
    private readonly receiptRepo: Repository<Receipt>,
  ) {}

  async findAll(dto: PaginationDto & { status?: string; customerId?: string }) {
    const { page = 1, pageSize = 20, keyword, status, customerId, sortBy, sortOrder, ...rest } = dto;
    const qb = this.receivableRepo.createQueryBuilder('ar');

    if (keyword) {
      qb.andWhere('(ar.receivableNo LIKE :kw OR ar.customerName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('ar.status = :status', { status });
    if (customerId) qb.andWhere('ar.customerId = :customerId', { customerId });
    if (sortBy) qb.orderBy(`ar.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ar.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<AccountsReceivable> {
    const receivable = await this.receivableRepo.findOne({
      where: { id },
      relations: ['receipts'],
    });
    if (!receivable) throw new NotFoundException(`应收记录 ${id} 不存在`);
    return receivable;
  }

  async getStats() {
    const all = await this.receivableRepo.find();
    const totalAmount = all.reduce((s, r) => s + Number(r.amount), 0);
    const settledAmount = all.reduce((s, r) => s + Number(r.settledAmount), 0);
    const balance = totalAmount - settledAmount;
    const count = all.length;
    const overdueCount = all.filter(
      (r) => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'settled',
    ).length;
    return { totalAmount, settledAmount, balance, count, overdueCount };
  }

  async getAging() {
    const receivables = await this.receivableRepo.find({
      where: [{ status: 'pending' }, { status: 'partial' }],
    });
    const today = dayjs();
    const aging: Record<string, number> = {
      current: 0,      // 未到期
      within30: 0,     // 1-30天
      within90: 0,     // 31-90天
      within180: 0,    // 91-180天
      over180: 0,      // 180天以上
    };
    for (const r of receivables) {
      const balance = Number(r.amount) - Number(r.settledAmount);
      if (balance <= 0) continue;
      const due = r.dueDate ? dayjs(r.dueDate) : today;
      const diff = today.diff(due, 'day');
      if (diff <= 0) aging.current += balance;
      else if (diff <= 30) aging.within30 += balance;
      else if (diff <= 90) aging.within90 += balance;
      else if (diff <= 180) aging.within180 += balance;
      else aging.over180 += balance;
    }
    return aging;
  }

  async create(dto: CreateReceivableDto, userId: string): Promise<AccountsReceivable> {
    const today = new Date();
    const count = await this.receivableRepo
      .createQueryBuilder('ar')
      .where('ar.receivableNo LIKE :prefix', { prefix: `AR${dayjs().format('YYYYMM')}%` })
      .getCount();
    const receivableNo = `AR${dayjs().format('YYYYMM')}${String(count + 1).padStart(3, '0')}`;

    const receivable = this.receivableRepo.create({
      receivableNo,
      ...dto,
      settledAmount: 0,
      status: 'pending',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.receivableRepo.save(receivable);
  }

  async remove(id: string): Promise<void> {
    const receivable = await this.findOne(id);
    if (receivable.status !== 'pending') {
      throw new BadRequestException('只有待收状态才能删除');
    }
    await this.receivableRepo.remove(receivable);
  }

  // ---- 收款 ----

  async addReceipt(dto: CreateReceiptDto, userId: string): Promise<Receipt> {
    const receivable = await this.findOne(dto.receivableId);
    if (receivable.status === 'settled' || receivable.status === 'written_off') {
      throw new BadRequestException('该应收已结清或已核销');
    }

    const today = new Date();
    const count = await this.receiptRepo
      .createQueryBuilder('rc')
      .where('rc.receiptNo LIKE :prefix', { prefix: `REC${dayjs().format('YYYYMM')}%` })
      .getCount();
    const receiptNo = generateCode('receipt', count + 1, today);

    const receipt = this.receiptRepo.create({
      receivableId: dto.receivableId,
      receiptNo,
      receiptDate: new Date(dto.receiptDate),
      amount: dto.amount,
      status: 'confirmed',
      remark: dto.remark ?? null,
      createdBy: userId,
    });
    const saved = await this.receiptRepo.save(receipt);

    // 更新应收结算金额
    receivable.settledAmount = Number(receivable.settledAmount) + Number(dto.amount);
    if (Number(receivable.settledAmount) >= Number(receivable.amount)) {
      receivable.status = 'settled';
    } else {
      receivable.status = 'partial';
    }
    receivable.updatedBy = userId;
    await this.receivableRepo.save(receivable);

    return saved;
  }

  async getReceipts(receivableId: string): Promise<Receipt[]> {
    return this.receiptRepo.find({
      where: { receivableId },
      order: { receiptDate: 'DESC' },
    });
  }

  /** 取消收款 */
  async cancelReceipt(receiptId: string): Promise<void> {
    const receipt = await this.receiptRepo.findOne({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException(`收款记录 ${receiptId} 不存在`);
    if (receipt.status === 'cancelled') throw new BadRequestException('该收款已取消');

    receipt.status = 'cancelled';
    await this.receiptRepo.save(receipt);

    // 回冲应收
    const receivable = await this.findOne(receipt.receivableId);
    receivable.settledAmount = Number(receivable.settledAmount) - Number(receipt.amount);
    if (Number(receivable.settledAmount) <= 0) {
      receivable.settledAmount = 0;
      receivable.status = 'pending';
    } else {
      receivable.status = 'partial';
    }
    await this.receivableRepo.save(receivable);
  }
}
