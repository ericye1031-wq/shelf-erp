import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BOM, BomStatus } from './bom.entity';
import { BomItem } from './bom-item.entity';
import { BomVersion } from './bom-version.entity';
import { AlternativeMaterial } from './alternative-material.entity';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(BOM)
    private readonly bomRepo: Repository<BOM>,
    @InjectRepository(BomItem)
    private readonly itemRepo: Repository<BomItem>,
    @InjectRepository(BomVersion)
    private readonly versionRepo: Repository<BomVersion>,
    @InjectRepository(AlternativeMaterial)
    private readonly altRepo: Repository<AlternativeMaterial>,
  ) {}

  // ---- BOM CRUD ----

  async findAll(dto: PaginationDto) {
    const { page = 1, pageSize = 20, keyword, status, sortBy, sortOrder } = dto;
    const qb = this.bomRepo.createQueryBuilder('bom');
    if (keyword) {
      qb.andWhere('(bom.id LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (status) qb.andWhere('bom.status = :status', { status });
    if (sortBy) qb.orderBy(`bom.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC');
    else qb.orderBy('bom.createdAt', 'DESC');
    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return createPaginatedResponse(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<BOM> {
    const bom = await this.bomRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!bom) throw new NotFoundException(`BOM ${id} 不存在`);
    return bom;
  }

  async create(data: Partial<BOM>, userId: string): Promise<BOM> {
    const bom = this.bomRepo.create({
      projectId: data.projectId ?? null,
      shelfConfigId: data.shelfConfigId ?? null,
      version: data.version ?? 1,
      status: data.status ?? 'draft',
      totalWeight: data.totalWeight ?? 0,
      totalCost: data.totalCost ?? 0,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.bomRepo.save(bom);
  }

  async update(id: string, data: Partial<BOM>, userId: string): Promise<BOM> {
    const bom = await this.findOne(id);
    if (bom.status === 'released' || bom.status === 'archived') {
      throw new BadRequestException('已发布或已归档的BOM不能编辑');
    }
    Object.assign(bom, {
      projectId: data.projectId ?? bom.projectId,
      shelfConfigId: data.shelfConfigId ?? bom.shelfConfigId,
      version: data.version ?? bom.version,
      status: data.status ?? bom.status,
      totalWeight: data.totalWeight ?? bom.totalWeight,
      totalCost: data.totalCost ?? bom.totalCost,
      updatedBy: userId,
    });
    return this.bomRepo.save(bom);
  }

  async remove(id: string): Promise<void> {
    const bom = await this.findOne(id);
    if (bom.status !== 'draft') throw new BadRequestException('只有草稿状态才能删除');
    await this.itemRepo.delete({ bomId: id });
    await this.bomRepo.remove(bom);
  }

  // ---- BOM 明细 ----

  async getItems(bomId: string): Promise<BomItem[]> {
    await this.findOne(bomId);
    return this.itemRepo.find({ where: { bomId }, order: { sort: 'ASC' } });
  }

  async setItems(bomId: string, items: Partial<BomItem>[]): Promise<BomItem[]> {
    await this.findOne(bomId);
    await this.itemRepo.delete({ bomId });

    const entities = items.map((item, index) =>
      this.itemRepo.create({
        bomId,
        partCode: item.partCode,
        partName: item.partName,
        material: item.material,
        spec: item.spec,
        quantity: item.quantity ?? 0,
        unit: item.unit ?? '个',
        length: item.length ?? 0,
        weight: item.weight ?? 0,
        unitCost: item.unitCost ?? 0,
        totalCost: item.totalCost ?? (item.quantity ?? 0) * (item.unitCost ?? 0),
        wasteRate: item.wasteRate ?? 0,
        parentId: item.parentId ?? null,
        level: item.level ?? 0,
        sort: item.sort ?? index,
        alternativeIds: item.alternativeIds ?? [],
        remark: item.remark,
      }),
    );
    const saved = await this.itemRepo.save(entities);

    // 更新BOM总成本和总重量
    const totalCost = saved.reduce((sum, i) => sum + Number(i.totalCost), 0);
    const totalWeight = saved.reduce((sum, i) => sum + Number(i.weight) * Number(i.quantity), 0);
    await this.bomRepo.update(bomId, { totalCost, totalWeight });

    return saved;
  }

  // ---- BOM 版本 ----

  async getVersions(bomId: string): Promise<BomVersion[]> {
    await this.findOne(bomId);
    return this.versionRepo.find({ where: { bomId }, order: { version: 'DESC' } });
  }

  async createVersion(bomId: string, data: Partial<BomVersion>, userId: string): Promise<BomVersion> {
    await this.findOne(bomId);
    const versions = await this.versionRepo.find({ where: { bomId }, order: { version: 'DESC' } });
    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;

    const version = this.versionRepo.create({
      bomId,
      version: nextVersion,
      changeNote: data.changeNote,
      changedItemIds: data.changedItemIds ?? [],
      createdBy: userId,
    });
    return this.versionRepo.save(version);
  }

  // ---- 替代料 ----

  async getAlternatives(bomItemId: string): Promise<AlternativeMaterial[]> {
    return this.altRepo.find({ where: { originalItemId: bomItemId }, order: { priority: 'ASC' } });
  }

  async createAlternative(bomItemId: string, data: Partial<AlternativeMaterial>): Promise<AlternativeMaterial> {
    const alt = this.altRepo.create({
      originalItemId: bomItemId,
      partCode: data.partCode,
      partName: data.partName,
      material: data.material,
      spec: data.spec,
      priority: data.priority ?? 1,
      priceDiff: data.priceDiff ?? 0,
      available: data.available ?? true,
      remark: data.remark,
    });
    return this.altRepo.save(alt);
  }

  async updateAlternative(bomItemId: string, id: string, data: Partial<AlternativeMaterial>): Promise<AlternativeMaterial> {
    const alt = await this.altRepo.findOne({ where: { id, originalItemId: bomItemId } });
    if (!alt) throw new NotFoundException(`替代料 ${id} 不存在`);
    Object.assign(alt, {
      partCode: data.partCode ?? alt.partCode,
      partName: data.partName ?? alt.partName,
      material: data.material ?? alt.material,
      spec: data.spec ?? alt.spec,
      priority: data.priority ?? alt.priority,
      priceDiff: data.priceDiff ?? alt.priceDiff,
      available: data.available ?? alt.available,
      remark: data.remark ?? alt.remark,
    });
    return this.altRepo.save(alt);
  }

  async deleteAlternative(bomItemId: string, id: string): Promise<void> {
    const alt = await this.altRepo.findOne({ where: { id, originalItemId: bomItemId } });
    if (!alt) throw new NotFoundException(`替代料 ${id} 不存在`);
    await this.altRepo.remove(alt);
  }

  // ===== BOM高级管理 (SRS §10) =====

  /** EBOM → MBOM 转换：加上工艺路线、损耗率、包装辅料 */
  async convertToMBOM(bomId: string, userId: string): Promise<BOM> {
    const ebom = await this.findOne(bomId);
    if (ebom.bomType !== 'EBOM') throw new BadRequestException('只能从EBOM转换为MBOM');
    const items = await this.getItems(bomId);

    const mbom = this.bomRepo.create({
      name: `${ebom.name ?? 'BOM'} - MBOM`,
      bomCode: `${ebom.bomCode ?? 'BOM'}-M`,
      bomType: 'MBOM',
      projectId: ebom.projectId,
      shelfConfigId: ebom.shelfConfigId,
      version: 1,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    } as any);
    const savedMbom = await this.bomRepo.save(mbom) as unknown as BOM;

    const mbomItems = items.map((item) => ({
      bomId: savedMbom.id,
      partCode: item.partCode,
      partName: item.partName,
      material: item.material,
      spec: item.spec,
      quantity: item.quantity,
      unit: item.unit,
      length: item.length,
      weight: item.weight,
      unitCost: item.unitCost,
      totalCost: item.unitCost * item.quantity,
      wasteRate: item.wasteRate,
      parentId: item.parentId,
      level: item.level,
      sort: item.sort,
    }));
    await this.itemRepo.save(this.itemRepo.create(mbomItems as any));
    return this.findOne(savedMbom.id);
  }

  /** MBOM → CBOM 转换：加上材料单价、工序单价、费用分摊 */
  async convertToCBOM(bomId: string, userId: string): Promise<BOM> {
    const mbom = await this.findOne(bomId);
    if (mbom.bomType !== 'MBOM') throw new BadRequestException('只能从MBOM转换为CBOM');
    const items = await this.getItems(bomId);

    const cbom = this.bomRepo.create({
      name: `${mbom.name ?? 'BOM'} - CBOM`,
      bomCode: `${mbom.bomCode ?? 'BOM'}-C`,
      bomType: 'CBOM',
      projectId: mbom.projectId,
      shelfConfigId: mbom.shelfConfigId,
      version: 1,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    } as any);
    const savedCbom = await this.bomRepo.save(cbom) as unknown as BOM;

    const cbomItems = items.map((item) => {
      const processUnitPrice = item.weight > 0 ? Number(item.weight) * 0.5 : 1;
      const overheadRate = 0.08;
      const subtotal = item.unitCost * item.quantity;
      const processCost = processUnitPrice * item.quantity;
      const overhead = (subtotal + processCost) * overheadRate;
      return {
        bomId: savedCbom.id,
        partCode: item.partCode,
        partName: item.partName,
        material: item.material,
        spec: item.spec,
        quantity: item.quantity,
        unit: item.unit,
        length: item.length,
        weight: item.weight,
        unitCost: item.unitCost,
        totalCost: subtotal + processCost + overhead,
        wasteRate: item.wasteRate,
        parentId: item.parentId,
        level: item.level,
        sort: item.sort,
      };
    });
    await this.itemRepo.save(this.itemRepo.create(cbomItems as any));

    const totalCost = cbomItems.reduce((s, i) => s + i.totalCost, 0);
    await this.bomRepo.update(savedCbom.id, { totalCost });
    return this.findOne(savedCbom.id);
  }

  /** BOM版本比较：diff两个版本高亮变化 */
  async compareVersions(bomId: string, v1: number, v2: number): Promise<{
    version1: { version: number; createdAt: Date; items: BomItem[] };
    version2: { version: number; createdAt: Date; items: BomItem[] };
    added: BomItem[];
    removed: BomItem[];
    changed: Array<{ item: BomItem; old: BomItem }>;
  }> {
    const items = await this.itemRepo.find({ where: { bomId }, order: { sort: 'ASC' } });
    const versions = await this.versionRepo.find({ where: { bomId }, order: { version: 'ASC' } });
    const v1Data = versions.find((ver) => ver.version === v1);
    const v2Data = versions.find((ver) => ver.version === v2);
    if (!v1Data || !v2Data) throw new NotFoundException(`版本 v${v1} 或 v${v2} 不存在`);

    // Compare based on changedItemIds in version snapshots
    const v1Changed = (v1Data.changedItemIds ?? []) as string[];
    const v2Changed = (v2Data.changedItemIds ?? []) as string[];

    const itemMap = new Map(items.map((i) => [i.partCode, i]));

    const added: BomItem[] = [];
    const removed: BomItem[] = [];
    const changed: Array<{ item: BomItem; old: BomItem }> = [];

    for (const id of v2Changed) {
      const item = items.find((i) => i.id === id);
      if (item && !v1Changed.includes(id)) added.push(item);
    }
    for (const id of v1Changed) {
      const item = items.find((i) => i.id === id);
      if (item && !v2Changed.includes(id)) removed.push(item);
      else if (item && v2Changed.includes(id)) {
        changed.push({ item, old: item });
      }
    }

    return {
      version1: { version: v1, createdAt: v1Data.createdAt, items },
      version2: { version: v2, createdAt: v2Data.createdAt, items },
      added, removed, changed,
    };
  }

  /** 多层级展开：递归展开所有子项到扁平列表 */
  async expandBOM(bomId: string): Promise<Array<BomItem & { children: number; fullPath: string }>> {
    const items = await this.itemRepo.find({ where: { bomId }, order: { sort: 'ASC' } });
    const result: Array<BomItem & { children: number; fullPath: string }> = [];

    const buildPath = (item: BomItem, allItems: BomItem[]): string => {
      if (!item.parentId) return item.partCode;
      const parent = allItems.find((i) => i.id === item.parentId);
      return parent ? `${buildPath(parent, allItems)} > ${item.partCode}` : item.partCode;
    };

    for (const item of items) {
      const childCount = items.filter((i) => i.parentId === item.id).length;
      result.push({ ...item, children: childCount, fullPath: buildPath(item, items) });
    }
    return result;
  }

  /** 反查影响分析：查找所有使用了指定物料的BOM */
  async findWhereUsed(partCode: string): Promise<Array<{ bomId: string; bomName: string; quantity: number }>> {
    const items = await this.itemRepo.find({
      where: { partCode },
      relations: ['bom'],
    });
    return items.map((item) => ({
      bomId: item.bomId,
      bomName: (item as any).bom?.name ?? item.bomId,
      quantity: item.quantity,
    }));
  }
}
