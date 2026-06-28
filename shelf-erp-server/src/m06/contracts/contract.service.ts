import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './contract.entity';
import { PaymentPlan } from './payment-plan.entity';
import { Invoice } from './invoice.entity';
import { CreateContractDto, UpdateContractDto, CreatePaymentPlanDto, CreateInvoiceDto } from './dto/contract.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(PaymentPlan)
    private readonly paymentPlanRepo: Repository<PaymentPlan>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.contractRepo.createQueryBuilder('c');
    if (keyword) {
      qb.andWhere('(c.code LIKE :kw OR c.title LIKE :kw OR c.customerName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('c.status = :status', { status });
    if (sortBy) qb.orderBy(`c.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('c.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['paymentPlans', 'invoices'],
    });
    if (!contract) throw new NotFoundException(`合同 ${id} 不存在`);
    return contract;
  }

  async create(dto: CreateContractDto, userId: string): Promise<Contract> {
    const code = generateCode('contract', 1);
    const contract = this.contractRepo.create({
      code,
      quotationId: dto.quotationId ?? null,
      customerId: dto.customerId,
      customerName: dto.customerName,
      title: dto.title,
      amount: dto.amount ?? 0,
      currencyId: dto.currencyId ?? null,
      signDate: dto.signDate ? new Date(dto.signDate) : null,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
      paymentTerms: dto.paymentTerms,
      status: 'draft',
      terms: dto.terms,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.contractRepo.save(contract);
  }

  async update(id: string, dto: UpdateContractDto, userId: string): Promise<Contract> {
    const contract = await this.findOne(id);
    if (contract.status !== 'draft') throw new BadRequestException('只有草稿状态才能编辑');
    Object.assign(contract, dto, {
      signDate: dto.signDate ? new Date(dto.signDate) : contract.signDate,
      deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : contract.deliveryDate,
      updatedBy: userId,
    });
    return this.contractRepo.save(contract);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    if (contract.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.contractRepo.remove(contract);
  }

  /** 状态流转 */
  async changeStatus(id: string, status: ContractStatus, userId: string): Promise<Contract> {
    const contract = await this.findOne(id);
    const validTransitions: Record<string, ContractStatus[]> = {
      draft: ['reviewing'],
      reviewing: ['approved', 'draft'],
      approved: ['executing'],
      executing: ['completed', 'terminated'],
    };
    const allowed = validTransitions[contract.status] ?? [];
    if (!allowed.includes(status)) throw new BadRequestException(`不允许从 ${contract.status} 变更为 ${status}`);
    
    // 合同审批通过时，自动创建项目
    if (contract.status === 'reviewing' && status === 'approved') {
      // TODO: 调用M07项目Service创建项目
      // 这里先预留逻辑，等事件驱动实现后补充
    }
    
    // 合同进入执行状态时，更新项目状态
    if (status === 'executing' && contract.projectId) {
      // TODO: 调用M07项目Service更新项目状态为in_progress
    }
    
    contract.status = status;
    contract.updatedBy = userId;
    return this.contractRepo.save(contract);
  }

  /** 更新回款统计 */
  async updatePaidAmount(contractId: string): Promise<void> {
    const result = await this.paymentPlanRepo
      .createQueryBuilder('pp')
      .select('SUM(pp.actualAmount)', 'total')
      .where('pp.contractId = :cid', { cid: contractId })
      .andWhere('pp.status = :status', { status: 'received' })
      .getRawOne();
    
    const paidAmount = parseFloat(result?.total ?? '0');
    await this.contractRepo.update(contractId, { paidAmount });
  }

  /** 更新发票统计 */
  async updateInvoiceAmount(contractId: string): Promise<void> {
    const result = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.amount)', 'total')
      .where('inv.contractId = :cid', { cid: contractId })
      .getRawOne();
    
    const invoiceAmount = parseFloat(result?.total ?? '0');
    await this.contractRepo.update(contractId, { invoiceAmount });
  }

  // ---- 回款计划 ----
  async getPaymentPlans(contractId: string): Promise<PaymentPlan[]> {
    await this.findOne(contractId);
    return this.paymentPlanRepo.find({ where: { contractId }, order: { plannedDate: 'ASC' } });
  }

  async addPaymentPlan(contractId: string, dto: CreatePaymentPlanDto, userId: string): Promise<PaymentPlan> {
    await this.findOne(contractId);
    const plan = this.paymentPlanRepo.create({
      contractId,
      stage: dto.stage,
      amount: dto.amount,
      ratio: dto.ratio ?? 0,
      plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : null,
      remark: dto.remark,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.paymentPlanRepo.save(plan);
  }

  async updatePaymentPlanStatus(planId: string, status: string, userId: string): Promise<PaymentPlan> {
    const plan = await this.paymentPlanRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`回款计划 ${planId} 不存在`);
    plan.status = status as PaymentPlan['status'];
    plan.updatedBy = userId;
    return this.paymentPlanRepo.save(plan);
  }

  // ---- 发票 ----
  async getInvoices(contractId: string): Promise<Invoice[]> {
    await this.findOne(contractId);
    return this.invoiceRepo.find({ where: { contractId }, order: { createdAt: 'DESC' } });
  }

  async addInvoice(contractId: string, dto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    await this.findOne(contractId);
    const code = generateCode('invoice', 1);
    const invoice = this.invoiceRepo.create({
      contractId,
      code,
      type: dto.type,
      amount: dto.amount,
      taxRate: dto.taxRate ?? 0,
      taxAmount: dto.amount * (dto.taxRate ?? 0),
      issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : null,
      remark: dto.remark,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.invoiceRepo.save(invoice);
  }
}
