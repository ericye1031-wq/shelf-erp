import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseReimbursement, ExpenseStatus } from './expense-reimbursement.entity';
import {
  CreateExpenseReimbursementDto,
  UpdateExpenseReimbursementDto,
} from './dto/expense-reimbursement.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

/**
 * 简单费用标准：按费用类型设定的月限额
 * 生产环境可从数据库或配置中心读取
 */
const EXPENSE_STANDARDS: Record<string, number> = {
  travel: 5000,
  entertainment: 3000,
  office: 2000,
  transport: 3000,
  other: 5000,
};

export interface ExpenseStandardCheck {
  withinLimit: boolean;
  limit: number;
  currentAmount: number;
  monthToDate: number;
  message: string;
}

@Injectable()
export class ExpenseReimbursementService {
  constructor(
    @InjectRepository(ExpenseReimbursement)
    private readonly expenseRepo: Repository<ExpenseReimbursement>,
  ) {}

  /**
   * 费用标准超限检查
   * 按申请人 + 类型统计当月已报销(approved/paid)总额
   * 当前金额 + 当月累计 > 限额 → 超限告警
   */
  async checkExpenseStandard(
    applicantId: string,
    expenseType: string,
    amount: number,
  ): Promise<ExpenseStandardCheck> {
    const limit = EXPENSE_STANDARDS[expenseType] ?? 5000;
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const { sum } = await this.expenseRepo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.amount), 0)', 'sum')
      .where('e.applicantId = :applicantId', { applicantId })
      .andWhere('e.expenseType = :expenseType', { expenseType })
      .andWhere('e.status IN (:...statuses)', { statuses: ['approved', 'paid'] })
      .andWhere('e.submitDate >= :monthStart', { monthStart })
      .getRawOne();

    const monthToDate = Number(sum) || 0;
    const currentAmount = amount;
    const withinLimit = monthToDate + currentAmount <= limit;

    return {
      withinLimit,
      limit,
      currentAmount,
      monthToDate,
      message: withinLimit
        ? '未超限额'
        : `超出限额！限额${limit}，当月已报销${monthToDate}，本次${currentAmount}`,
    };
  }

  async findAll(dto: PaginationDto & { expenseType?: string; applicantId?: string }) {
    const { page = 1, pageSize = 20, keyword, status, expenseType, applicantId } = dto;
    const qb = this.expenseRepo.createQueryBuilder('e');

    if (keyword) {
      qb.andWhere('(e.expenseCode LIKE :kw OR e.applicantName LIKE :kw OR e.description LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    if (status) qb.andWhere('e.status = :status', { status });
    if (expenseType) qb.andWhere('e.expenseType = :expenseType', { expenseType });
    if (applicantId) qb.andWhere('e.applicantId = :applicantId', { applicantId });

    qb.orderBy('e.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();

    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<ExpenseReimbursement> {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException(`报销单 ${id} 不存在`);
    return expense;
  }

  async create(
    dto: CreateExpenseReimbursementDto,
    userId: string,
  ): Promise<ExpenseReimbursement> {
    const existing = await this.expenseRepo.findOne({
      where: { expenseCode: dto.expenseCode },
    });
    if (existing) throw new BadRequestException(`报销单号 ${dto.expenseCode} 已存在`);

    const expense = this.expenseRepo.create({
      ...dto,
      expenseType: dto.expenseType as ExpenseReimbursement['expenseType'],
      status: 'draft' as ExpenseStatus,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.expenseRepo.save(expense);
  }

  async update(
    id: string,
    dto: UpdateExpenseReimbursementDto,
    userId: string,
  ): Promise<ExpenseReimbursement> {
    const expense = await this.findOne(id);
    if (expense.status !== 'draft') {
      throw new BadRequestException('仅草稿状态可编辑');
    }

    Object.assign(expense, dto, { updatedBy: userId });
    return this.expenseRepo.save(expense);
  }

  async submit(id: string, userId: string): Promise<ExpenseReimbursement> {
    const expense = await this.findOne(id);
    if (expense.status !== 'draft') {
      throw new BadRequestException('仅草稿状态可提交');
    }

    // Check standard before submitting
    const check = await this.checkExpenseStandard(
      expense.applicantId,
      expense.expenseType,
      expense.amount,
    );

    expense.status = 'submitted';
    expense.submitDate = new Date().toISOString().slice(0, 10);
    expense.updatedBy = userId;
    // Attach over-limit warning to remark if over limit
    if (!check.withinLimit) {
      expense.remark = expense.remark
        ? `${expense.remark} | ${check.message}`
        : check.message;
    }

    return this.expenseRepo.save(expense);
  }

  async approve(
    id: string,
    userId: string,
    approverId: string,
  ): Promise<ExpenseReimbursement> {
    const expense = await this.findOne(id);
    if (expense.status !== 'submitted') {
      throw new BadRequestException('仅已提交状态可审批');
    }

    expense.status = 'approved';
    expense.approverId = approverId;
    expense.approvedAt = new Date();
    expense.updatedBy = userId;
    return this.expenseRepo.save(expense);
  }

  async reject(id: string, userId: string, reason?: string): Promise<ExpenseReimbursement> {
    const expense = await this.findOne(id);
    if (expense.status !== 'submitted') {
      throw new BadRequestException('仅已提交状态可驳回');
    }

    expense.status = 'rejected';
    expense.remark = reason ? `${expense.remark ?? ''} | 驳回原因: ${reason}` : expense.remark;
    expense.updatedBy = userId;
    return this.expenseRepo.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    if (expense.status !== 'draft') {
      throw new BadRequestException('仅草稿状态可删除');
    }
    await this.expenseRepo.remove(expense);
  }
}
