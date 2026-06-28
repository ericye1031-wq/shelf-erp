import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsPayable } from './payable.entity';
import { PaymentRequest } from './payment-request.entity';
import { Payment } from './payment.entity';
import {
  CreatePayableDto,
  CreatePaymentRequestDto,
  CreatePaymentDto,
} from './dto/payable.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';
import dayjs from 'dayjs';

@Injectable()
export class PayableService {
  constructor(
    @InjectRepository(AccountsPayable)
    private readonly payableRepo: Repository<AccountsPayable>,
    @InjectRepository(PaymentRequest)
    private readonly requestRepo: Repository<PaymentRequest>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  // ---- 应付 ----

  async findAll(dto: PaginationDto & { status?: string; supplierId?: string }) {
    const { page = 1, pageSize = 20, keyword, status, supplierId, sortBy, sortOrder, ...rest } = dto;
    const qb = this.payableRepo.createQueryBuilder('ap');

    if (keyword) {
      qb.andWhere('(ap.payableNo LIKE :kw OR ap.supplierName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('ap.status = :status', { status });
    if (supplierId) qb.andWhere('ap.supplierId = :supplierId', { supplierId });
    if (sortBy) qb.orderBy(`ap.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('ap.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<AccountsPayable> {
    const payable = await this.payableRepo.findOne({
      where: { id },
      relations: ['payments'],
    });
    if (!payable) throw new NotFoundException(`应付记录 ${id} 不存在`);
    return payable;
  }

  async getStats() {
    const all = await this.payableRepo.find();
    const totalAmount = all.reduce((s, r) => s + Number(r.amount), 0);
    const settledAmount = all.reduce((s, r) => s + Number(r.settledAmount), 0);
    const balance = totalAmount - settledAmount;
    const count = all.length;
    const overdueCount = all.filter(
      (r) => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'settled',
    ).length;
    return { totalAmount, settledAmount, balance, count, overdueCount };
  }

  async create(dto: CreatePayableDto, userId: string): Promise<AccountsPayable> {
    const payableNo = `AP${dayjs().format('YYYYMM')}${String(Date.now() % 1000).padStart(3, '0')}`;
    const payable = this.payableRepo.create({
      payableNo,
      ...dto,
      settledAmount: 0,
      status: 'pending',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.payableRepo.save(payable);
  }

  async remove(id: string): Promise<void> {
    const payable = await this.findOne(id);
    if (payable.status !== 'pending') {
      throw new BadRequestException('只有待付状态才能删除');
    }
    await this.payableRepo.remove(payable);
  }

  // ---- 付款申请 ----

  async createPaymentRequest(dto: CreatePaymentRequestDto, userId: string): Promise<PaymentRequest> {
    const payable = await this.findOne(dto.payableId);
    if (payable.status === 'settled' || payable.status === 'written_off') {
      throw new BadRequestException('该应付已结清或已核销');
    }

    const count = await this.requestRepo
      .createQueryBuilder('pr')
      .where('pr.requestNo LIKE :prefix', { prefix: `PREQ${dayjs().format('YYYYMM')}%` })
      .getCount();
    const requestNo = `PREQ${dayjs().format('YYYYMM')}${String(count + 1).padStart(3, '0')}`;

    const request = this.requestRepo.create({
      payableId: dto.payableId,
      requestNo,
      bankAccountId: dto.bankAccountId ?? null,
      amount: dto.amount,
      requestDate: new Date(dto.requestDate),
      status: 'draft',
      remark: dto.remark ?? null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.requestRepo.save(request);
  }

  async submitRequest(requestId: string, userId: string): Promise<PaymentRequest> {
    const request = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException(`付款申请 ${requestId} 不存在`);
    if (request.status !== 'draft') throw new BadRequestException('只有草稿状态才能提交');
    request.status = 'submitted';
    request.updatedBy = userId;
    return this.requestRepo.save(request);
  }

  async approveRequest(requestId: string, userId: string): Promise<PaymentRequest> {
    const request = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException(`付款申请 ${requestId} 不存在`);
    if (request.status !== 'submitted') throw new BadRequestException('只有已提交状态才能审批');
    request.status = 'approved';
    request.approvedBy = userId;
    request.approvedAt = new Date();
    request.updatedBy = userId;
    return this.requestRepo.save(request);
  }

  async rejectRequest(requestId: string, userId: string): Promise<PaymentRequest> {
    const request = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException(`付款申请 ${requestId} 不存在`);
    if (request.status !== 'submitted') throw new BadRequestException('只有已提交状态才能驳回');
    request.status = 'rejected';
    request.updatedBy = userId;
    return this.requestRepo.save(request);
  }

  async findRequests(dto: PaginationDto & { status?: string; payableId?: string }) {
    const { page = 1, pageSize = 20, keyword, status, payableId, sortBy, sortOrder, ...rest } = dto;
    const qb = this.requestRepo.createQueryBuilder('pr');

    if (keyword) {
      qb.andWhere('(pr.requestNo LIKE :kw OR pr.remark LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('pr.status = :status', { status });
    if (payableId) qb.andWhere('pr.payableId = :payableId', { payableId });
    qb.orderBy('pr.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  // ---- 付款 ----

  async addPayment(dto: CreatePaymentDto, userId: string): Promise<Payment> {
    const payable = await this.findOne(dto.payableId);
    if (payable.status === 'settled' || payable.status === 'written_off') {
      throw new BadRequestException('该应付已结清或已核销');
    }

    const today = new Date();
    const count = await this.paymentRepo
      .createQueryBuilder('p')
      .where('p.paymentNo LIKE :prefix', { prefix: `PAY${dayjs().format('YYYYMM')}%` })
      .getCount();
    const paymentNo = generateCode('payment', count + 1, today);

    const payment = this.paymentRepo.create({
      payableId: dto.payableId,
      paymentNo,
      paymentDate: new Date(dto.paymentDate),
      bankAccountId: dto.bankAccountId ?? null,
      amount: dto.amount,
      status: 'confirmed',
      remark: dto.remark ?? null,
      createdBy: userId,
    });
    const saved = await this.paymentRepo.save(payment);

    // 更新应付结算金额
    payable.settledAmount = Number(payable.settledAmount) + Number(dto.amount);
    if (Number(payable.settledAmount) >= Number(payable.amount)) {
      payable.status = 'settled';
    } else {
      payable.status = 'partial';
    }
    payable.updatedBy = userId;
    await this.payableRepo.save(payable);

    return saved;
  }

  async getPayments(payableId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { payableId },
      order: { paymentDate: 'DESC' },
    });
  }

  async cancelPayment(paymentId: string): Promise<void> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException(`付款记录 ${paymentId} 不存在`);
    if (payment.status === 'cancelled') throw new BadRequestException('该付款已取消');

    payment.status = 'cancelled';
    await this.paymentRepo.save(payment);

    // 回冲应付
    const payable = await this.findOne(payment.payableId);
    payable.settledAmount = Number(payable.settledAmount) - Number(payment.amount);
    if (Number(payable.settledAmount) <= 0) {
      payable.settledAmount = 0;
      payable.status = 'pending';
    } else {
      payable.status = 'partial';
    }
    await this.payableRepo.save(payable);
  }
}
