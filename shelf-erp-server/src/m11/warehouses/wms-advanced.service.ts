import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation, StockCount, StockCountItem } from './wms-entities';
import { Inventory, InventoryTransaction } from './inventory.entity';

export interface FifoPickResult {
  inventoryId: string;
  partName: string;
  batchNo: string;
  locCode: string;
  pickedQty: number;
  remainingQty: number;
  productionDate: string;
}

@Injectable()
export class WmsAdvancedService {
  constructor(
    @InjectRepository(StorageLocation)
    private readonly locRepo: Repository<StorageLocation>,
    @InjectRepository(StockCount)
    private readonly countRepo: Repository<StockCount>,
    @InjectRepository(StockCountItem)
    private readonly countItemRepo: Repository<StockCountItem>,
    @InjectRepository(Inventory)
    private readonly invRepo: Repository<Inventory>,
    @InjectRepository(InventoryTransaction)
    private readonly txRepo: Repository<InventoryTransaction>,
  ) {}

  // ========== 五级库位管理 ==========

  async findAllLocations(warehouseId?: string): Promise<StorageLocation[]> {
    const where = warehouseId ? { warehouseId } : {};
    return this.locRepo.find({ where, order: { locCode: 'ASC' } });
  }

  async createLocation(data: Partial<StorageLocation>, userId: string): Promise<StorageLocation> {
    const loc = this.locRepo.create({ ...data, createdBy: userId, updatedBy: userId } as any);
    return this.locRepo.save(loc) as unknown as StorageLocation;
  }

  /** 生成库位编码: 例如 RM-A-01-001 (原料仓-A区-1排-1号) */
  static generateLocCode(zone: string, aisle: string, row: string, position: string): string {
    return `${zone}-${aisle}-${row.padStart(2, '0')}-${position.padStart(3, '0')}`;
  }

  // ========== FIFO先进先出出库 ==========

  /**
   * FIFO出库策略 (SRS §11.2)
   * 按生产日期升序排列，优先出最早生产的批次
   */
  async fifoPick(
    partCode: string,
    requestedQty: number,
    warehouseId?: string,
  ): Promise<FifoPickResult[]> {
    const qb = this.invRepo.createQueryBuilder('i')
      .where('i.partCode = :partCode', { partCode })
      .andWhere('i.quantity > 0');
    if (warehouseId) qb.andWhere('i.warehouseId = :wid', { wid: warehouseId });
    qb.orderBy('i.createdAt', 'ASC'); // FIFO: earliest first

    const candidates = await qb.getMany();
    if (candidates.length === 0) {
      throw new NotFoundException(`物料 ${partCode} 无可用库存`);
    }

    const results: FifoPickResult[] = [];
    let remaining = requestedQty;
    let totalAvailable = 0;

    for (const inv of candidates) {
      totalAvailable += Number(inv.quantity);
    }

    if (totalAvailable < requestedQty) {
      throw new BadRequestException(
        `库存不足: 需求 ${requestedQty}, 可用 ${totalAvailable}`,
      );
    }

    for (const inv of candidates) {
      if (remaining <= 0) break;
      const available = Number(inv.quantity);
      const pickQty = Math.min(available, remaining);

      results.push({
        inventoryId: inv.id,
        partName: inv.partName,
        batchNo: inv.batchNo ?? '',
        locCode: '', // can be populated from location join
        pickedQty: pickQty,
        remainingQty: available - pickQty,
        productionDate: inv.createdAt.toISOString().slice(0, 10),
      });

      remaining -= pickQty;
    }

    return results;
  }

  /** 执行FIFO出库 */
  async executeFifoOutbound(
    partCode: string,
    requestedQty: number,
    warehouseId: string,
    userId: string,
    remark?: string,
  ): Promise<{ picks: FifoPickResult[]; totalPicked: number }> {
    const picks = await this.fifoPick(partCode, requestedQty, warehouseId);
    let totalPicked = 0;

    for (const pick of picks) {
      const inv = await this.invRepo.findOne({ where: { id: pick.inventoryId } });
      if (!inv) continue;

      const beforeQty = Number(inv.quantity);
      inv.quantity = beforeQty - pick.pickedQty;
      inv.updatedBy = userId;
      await this.invRepo.save(inv);

      await this.txRepo.save(this.txRepo.create({
        inventoryId: inv.id,
        warehouseId: inv.warehouseId,
        type: 'out',
        quantity: pick.pickedQty,
        beforeQty,
        afterQty: inv.quantity,
        remark: remark ?? 'FIFO自动出库',
        createdBy: userId,
      } as any));

      totalPicked += pick.pickedQty;
    }

    return { picks, totalPicked };
  }

  // ========== 盘点管理 (SRS §11.2) ==========

  /** 创建盘点计划 */
  async createCountPlan(
    warehouseId: string,
    type: string,
    countDate: string,
    userId: string,
  ): Promise<StockCount> {
    const code = `CNT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`;

    const count = this.countRepo.create({
      warehouseId,
      countCode: code,
      type,
      countDate,
      status: 'pending',
      createdBy: userId,
    } as any);
    const saved = await this.countRepo.save(count) as unknown as StockCount;

    // 自动生成盘点项 (所有该仓库库存)
    const inventories = await this.invRepo.find({ where: { warehouseId } });
    const items = inventories.map((inv) =>
      this.countItemRepo.create({
        countId: saved.id,
        inventoryId: inv.id,
        locCode: '',
        bookQty: inv.quantity,
        actualQty: 0,
        diffQty: -Number(inv.quantity),
        status: 'pending',
      }),
    );
    await this.countItemRepo.save(items as any);

    return saved;
  }

  /** 录入盘点实际数量 */
  async recordCountItem(itemId: string, actualQty: number): Promise<StockCountItem> {
    const item = await this.countItemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException(`盘点项 ${itemId} 不存在`);

    item.actualQty = actualQty;
    item.diffQty = actualQty - Number(item.bookQty);
    item.status = 'counted';
    return this.countItemRepo.save(item) as unknown as StockCountItem;
  }

  /** 完成盘点 — 盘盈盘亏差异处理 */
  async finalizeCount(countId: string, userId: string): Promise<{ gains: number; losses: number }> {
    const count = await this.countRepo.findOne({ where: { id: countId } });
    if (!count) throw new NotFoundException(`盘点计划 ${countId} 不存在`);

    const items = await this.countItemRepo.find({ where: { countId } });
    let gains = 0; let losses = 0;

    for (const item of items) {
      const diff = Number(item.diffQty);
      if (diff > 0) gains += diff;
      else if (diff < 0) losses += Math.abs(diff);

      // 更新实际库存
      if (diff !== 0) {
        const inv = await this.invRepo.findOne({ where: { id: item.inventoryId } });
        if (inv) {
          const beforeQty = Number(inv.quantity);
          inv.quantity = Number(item.actualQty);
          inv.updatedBy = userId;
          await this.invRepo.save(inv);

          await this.txRepo.save(this.txRepo.create({
            inventoryId: inv.id,
            warehouseId: inv.warehouseId,
            type: 'adjust',
            quantity: diff,
            beforeQty,
            afterQty: inv.quantity,
            referenceNo: count.countCode,
            remark: `盘点调整: ${count.countCode}`,
            createdBy: userId,
          } as any));
        }
      }

      item.status = 'resolved';
      await this.countItemRepo.save(item);
    }

    count.status = 'completed';
    await this.countRepo.save(count);

    return { gains, losses };
  }

  /** 获取盘点结果差异列表 */
  async getCountDiff(countId: string): Promise<StockCountItem[]> {
    return this.countItemRepo.find({
      where: { countId },
      order: { diffQty: 'DESC' },
    });
  }

  // ========== 库位管理辅助 ==========

  async deleteLocation(id: string): Promise<void> {
    const result = await this.locRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`库位 ${id} 不存在`);
  }

  // ========== FIFO出库 (controller friendly wrapper) ==========

  async outboundFifo(
    warehouseId: string,
    partCode: string,
    requestedQty: number,
    userId: string,
    referenceNo?: string,
    remark?: string,
  ) {
    return this.executeFifoOutbound(partCode, requestedQty, warehouseId, userId, remark);
  }

  // ========== 批次查询 ==========

  async findBatches(partCode: string, warehouseId?: string): Promise<Array<{ batchNo: string; totalQty: number; firstIn: string }>> {
    const qb = this.invRepo.createQueryBuilder('i')
      .where('i.partCode = :partCode', { partCode })
      .andWhere('i.quantity > 0');
    if (warehouseId) qb.andWhere('i.warehouseId = :wid', { wid: warehouseId });
    qb.orderBy('i.createdAt', 'ASC');
    const items = await qb.getMany();

    const batchMap = new Map<string, { totalQty: number; firstIn: string }>();
    for (const item of items) {
      const bn = item.batchNo ?? 'NO-BATCH';
      if (batchMap.has(bn)) {
        batchMap.get(bn)!.totalQty += Number(item.quantity);
      } else {
        batchMap.set(bn, { totalQty: Number(item.quantity), firstIn: item.createdAt.toISOString().slice(0, 10) });
      }
    }
    return Array.from(batchMap.entries()).map(([batchNo, data]) => ({ batchNo, ...data }));
  }

  // ========== 呆滞库存 (alias) ==========

  async findSlowMoving(days: number, warehouseId?: string): Promise<Inventory[]> {
    return this.getSlowMoving(days);
  }

  // ========== 盘点 (controller friendly wrappers) ==========

  async findAllCounts(warehouseId?: string): Promise<StockCount[]> {
    const where = warehouseId ? { warehouseId } : {};
    return this.countRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createCount(body: { warehouseId: string; type: string; countDate: string; inventoryIds: string[] }, userId: string): Promise<StockCount> {
    return this.createCountPlan(body.warehouseId, body.type, body.countDate, userId);
  }

  async submitCountItems(
    countId: string,
    items: Array<{ inventoryId: string; actualQty: number; locCode?: string; remark?: string }>,
  ): Promise<{ processed: number }> {
    // Find count items for this count
    const countItems = await this.countItemRepo.find({ where: { countId } });
    let processed = 0;
    for (const input of items) {
      const match = countItems.find(ci => ci.inventoryId === input.inventoryId);
      if (match) {
        match.actualQty = input.actualQty;
        match.locCode = input.locCode ?? match.locCode;
        match.diffQty = input.actualQty - Number(match.bookQty);
        match.status = 'counted';
        match.remark = input.remark ?? match.remark;
        await this.countItemRepo.save(match as any);
        processed++;
      }
    }
    return { processed };
  }

  async reconcileCount(countId: string, userId: string): Promise<ReturnType<typeof this.finalizeCount>> {
    return this.finalizeCount(countId, userId);
  }

  /** 获取呆滞库存 (>90天未动) */
  async getSlowMoving(daysThreshold = 90): Promise<Inventory[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);

    return this.invRepo
      .createQueryBuilder('i')
      .where('i.quantity > 0')
      .andWhere('i.updatedAt <= :cutoff', { cutoff: cutoff.toISOString() })
      .orderBy('i.updatedAt', 'ASC')
      .getMany();
  }

  /** 按项目锁定库存 — 检查物料是否被某项目锁定 */
  async checkProjectReservation(partCode: string, projectId: string): Promise<{
    reserved: boolean;
    reservedQty: number;
    availableQty: number;
  }> {
    // 查询被该项目锁定的库存
    const reserved = await this.invRepo
      .createQueryBuilder('i')
      .where('i.partCode = :partCode', { partCode })
      .andWhere('i.quantity > 0')
      .getMany();

    let reservedQty = 0;
    let availableQty = 0;

    for (const inv of reserved) {
      availableQty += Number(inv.quantity);
    }

    return {
      reserved: false, // 当前无锁定机制，预留扩展
      reservedQty,
      availableQty,
    };
  }
}
