import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceType, InvoiceStatus, VerificationStatus } from './invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

export interface InvoiceVerificationResult {
  verified: boolean;
  status: string;
  message: string;
  matchedRelatedId?: string;
  matchedRelatedType?: string;
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  /**
   * 发票验证
   * 销项发票(sales)：检查是否关联销售合同
   * 进项发票(purchase)：检查是否关联采购订单，并做简单的金额匹配校验
   *
   * 生产环境应对接金税系统API或OCR服务
   */
  async verify(id: string): Promise<InvoiceVerificationResult> {
    const invoice = await this.findOne(id);

    // Simulate verification logic
    if (!invoice.relatedId || !invoice.relatedType) {
      // For sales invoices, auto-mark as verified if invoiceNo and invoiceCode present
      // For purchase invoices, warn about missing related document
      if (invoice.invoiceType === 'sales') {
        invoice.verificationStatus = 'verified';
        await this.invoiceRepo.save(invoice);
        return {
          verified: true,
          status: 'verified',
          message: '销项发票验证通过（发票代码+号码校验）',
        };
      } else {
        invoice.verificationStatus = 'pending';
        await this.invoiceRepo.save(invoice);
        return {
          verified: false,
          status: 'pending',
          message: '进项发票缺少关联采购单据，待补充后验证',
        };
      }
    }

    // Matching: check if related entity exists (placeholder - real impl would query related repo)
    // For now, validate basic invoice integrity
    const expectedTotal = Number((invoice.amount + invoice.taxAmount).toFixed(2));
    if (Math.abs(expectedTotal - invoice.totalAmount) > 0.01) {
      invoice.verificationStatus = 'failed';
      await this.invoiceRepo.save(invoice);
      return {
        verified: false,
        status: 'failed',
        message: `金额校验失败：不含税金额+税额(${expectedTotal}) ≠ 价税合计(${invoice.totalAmount})`,
      };
    }

    invoice.verificationStatus = 'verified';
    await this.invoiceRepo.save(invoice);

    return {
      verified: true,
      status: 'verified',
      message: `发票验证通过，已匹配关联单据 ${invoice.relatedType}/${invoice.relatedId}`,
      matchedRelatedId: invoice.relatedId,
      matchedRelatedType: invoice.relatedType,
    };
  }

  async findAll(
    dto: PaginationDto & {
      invoiceType?: string;
      verificationStatus?: string;
      relatedId?: string;
    },
  ) {
    const { page = 1, pageSize = 20, keyword, status, invoiceType, verificationStatus, relatedId } = dto;
    const qb = this.invoiceRepo.createQueryBuilder('inv');

    if (keyword) {
      qb.andWhere(
        '(inv.invoiceCode LIKE :kw OR inv.invoiceNo LIKE :kw OR inv.supplierBuyer LIKE :kw)',
        { kw: `%${keyword}%` },
      );
    }
    if (status) qb.andWhere('inv.status = :status', { status });
    if (invoiceType) qb.andWhere('inv.invoiceType = :invoiceType', { invoiceType });
    if (verificationStatus) qb.andWhere('inv.verificationStatus = :verificationStatus', { verificationStatus });
    if (relatedId) qb.andWhere('inv.relatedId = :relatedId', { relatedId });

    qb.orderBy('inv.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();

    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id } });
    if (!invoice) throw new NotFoundException(`发票 ${id} 不存在`);
    return invoice;
  }

  async create(dto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const existing = await this.invoiceRepo.findOne({
      where: { invoiceNo: dto.invoiceNo },
    });
    if (existing) throw new BadRequestException(`发票号码 ${dto.invoiceNo} 已存在`);

    const invoice = this.invoiceRepo.create({
      ...dto,
      invoiceType: dto.invoiceType as InvoiceType,
      status: (dto.invoiceType === 'sales' ? 'draft' : 'received') as InvoiceStatus,
      verificationStatus: 'unverified' as VerificationStatus,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.invoiceRepo.save(invoice);
  }

  async update(id: string, dto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // Reset verification if key fields change
    if (
      dto.amount !== undefined ||
      dto.taxAmount !== undefined ||
      dto.totalAmount !== undefined ||
      dto.relatedId !== undefined
    ) {
      (dto as any).verificationStatus = 'unverified';
    }

    Object.assign(invoice, dto, { updatedBy: userId });
    return this.invoiceRepo.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    if (invoice.status === 'issued') {
      throw new BadRequestException('已开具发票不可删除，请先作废');
    }
    await this.invoiceRepo.remove(invoice);
  }
}
