import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation, QuotationStatus } from './quotation.entity';
import { CostItem } from './cost-item.entity';
import { QuotationVersion } from './quotation-version.entity';
import { CreateQuotationDto, UpdateQuotationDto, CreateCostItemDto, VersionCompareDto } from './dto/quotation.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { generateCode } from '../../common/utils/code-generator.util';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(CostItem)
    private readonly costItemRepo: Repository<CostItem>,
    @InjectRepository(QuotationVersion)
    private readonly versionRepo: Repository<QuotationVersion>,
  ) {}

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.quotationRepo.createQueryBuilder('q');

    if (keyword) {
      qb.andWhere('(q.code LIKE :kw OR q.customerName LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) {
      qb.andWhere('q.status = :status', { status });
    }
    if (sortBy) qb.orderBy(`q.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('q.createdAt', 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepo.findOne({
      where: { id },
      relations: ['costItems', 'versions'],
    });
    if (!quotation) throw new NotFoundException(`报价单 ${id} 不存在`);
    return quotation;
  }

  async create(dto: CreateQuotationDto, userId: string): Promise<Quotation> {
    const code = generateCode('quotation', 1);
    const quotation = this.quotationRepo.create({
      code,
      inquiryId: dto.inquiryId ?? null,
      customerId: dto.customerId,
      customerName: dto.customerName,
      shelfTypeId: dto.shelfTypeId ?? null,
      shelfTypeName: dto.shelfTypeName ?? null,
      configId: dto.configId ?? null,
      configName: dto.configName ?? null,
      quantity: dto.quantity ?? 0,
      unitPrice: dto.unitPrice ?? 0,
      totalPrice: dto.totalPrice ?? 0,
      currencyId: dto.currencyId ?? null,
      exchangeRate: dto.exchangeRate ?? 1.0,
      margin: dto.margin ?? 0,
      deliveryDays: dto.deliveryDays ?? 0,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      version: 1,
      status: 'draft',
      remark: dto.remark,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.quotationRepo.save(quotation);
  }

  async update(id: string, dto: UpdateQuotationDto, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    // 只有draft状态才能编辑
    if (quotation.status !== 'draft') {
      throw new BadRequestException('只有草稿状态的报价单才能编辑');
    }

    Object.assign(quotation, dto, {
      validUntil: dto.validUntil ? new Date(dto.validUntil) : quotation.validUntil,
      updatedBy: userId,
    });
    return this.quotationRepo.save(quotation);
  }

  async remove(id: string): Promise<void> {
    const quotation = await this.findOne(id);
    if (quotation.status !== 'draft') {
      throw new BadRequestException('只有草稿状态的报价单才能删除');
    }
    await this.quotationRepo.remove(quotation);
  }

  /** 提交报价（状态变更） */
  async submit(id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);
    if (quotation.status !== 'draft') {
      throw new BadRequestException('只有草稿状态才能提交');
    }

    // 保存当前版本快照
    await this.saveVersion(quotation, userId);

    quotation.status = 'pending_review';
    quotation.updatedBy = userId;
    return this.quotationRepo.save(quotation);
  }

  /** 审批通过 */
  async approve(id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);
    if (quotation.status !== 'pending_review') {
      throw new BadRequestException('只有待审核状态才能审批');
    }
    quotation.status = 'approved';
    quotation.updatedBy = userId;
    return this.quotationRepo.save(quotation);
  }

  /** 发送报价 */
  async send(id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);
    if (quotation.status !== 'approved') {
      throw new BadRequestException('只有已审批状态才能发送');
    }
    quotation.status = 'sent';
    quotation.updatedBy = userId;
    return this.quotationRepo.save(quotation);
  }

  /** 接受/拒绝报价 */
  async respond(id: string, accept: boolean, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);
    if (quotation.status !== 'sent') {
      throw new BadRequestException('只有已发送状态才能响应');
    }
    quotation.status = accept ? 'accepted' : 'rejected';
    quotation.updatedBy = userId;
    return this.quotationRepo.save(quotation);
  }

  /** 获取报价版本列表 */
  async getVersions(quotationId: string): Promise<QuotationVersion[]> {
    await this.findOne(quotationId);
    return this.versionRepo.find({
      where: { quotationId },
      order: { version: 'DESC' },
    });
  }

  /** 版本对比 */
  async compareVersions(quotationId: string, dto: VersionCompareDto) {
    await this.findOne(quotationId);
    const v1 = await this.versionRepo.findOne({
      where: { quotationId, version: dto.v1 },
    });
    const v2 = await this.versionRepo.findOne({
      where: { quotationId, version: dto.v2 },
    });

    if (!v1) throw new NotFoundException(`版本 ${dto.v1} 不存在`);
    if (!v2) throw new NotFoundException(`版本 ${dto.v2} 不存在`);

    return {
      v1,
      v2,
      diff: {
        unitPrice: v2.unitPrice - v1.unitPrice,
        totalPrice: v2.totalPrice - v1.totalPrice,
        margin: v2.margin - v1.margin,
        changedFields: v2.changedFields ?? [],
      },
    };
  }

  /** 获取成本项列表 */
  async getCostItems(quotationId: string): Promise<CostItem[]> {
    await this.findOne(quotationId);
    return this.costItemRepo.find({
      where: { quotationId },
      order: { sortOrder: 'ASC' },
    });
  }

  /** 添加成本项 */
  async addCostItem(quotationId: string, dto: CreateCostItemDto): Promise<CostItem> {
    await this.findOne(quotationId);
    const item = this.costItemRepo.create({
      quotationId,
      ...dto,
    });
    return this.costItemRepo.save(item);
  }

  /** 批量设置成本项 */
  async setCostItems(quotationId: string, items: CreateCostItemDto[]): Promise<CostItem[]> {
    await this.findOne(quotationId);
    // 先删除旧的成本项
    await this.costItemRepo.delete({ quotationId });
    // 批量创建
    const entities = items.map((item, index) =>
      this.costItemRepo.create({
        quotationId,
        ...item,
        sortOrder: item.sortOrder ?? index,
      }),
    );
    return this.costItemRepo.save(entities);
  }

  /** 删除成本项 */
  async removeCostItem(quotationId: string, costItemId: string): Promise<void> {
    await this.findOne(quotationId);
    await this.costItemRepo.delete(costItemId);
  }

  /** 保存版本快照 */
  private async saveVersion(quotation: Quotation, userId: string): Promise<QuotationVersion> {
    const version = this.versionRepo.create({
      quotationId: quotation.id,
      version: quotation.version,
      unitPrice: quotation.unitPrice,
      totalPrice: quotation.totalPrice,
      margin: quotation.margin,
      changedFields: [],
      remark: `版本 ${quotation.version} 快照`,
      createdBy: userId,
    });
    return this.versionRepo.save(version);
  }
}
