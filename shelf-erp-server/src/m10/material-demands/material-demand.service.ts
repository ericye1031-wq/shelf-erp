import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MaterialDemand } from './material-demand.entity';

export interface MrpResult {
  workOrderId: string;
  totalMaterials: number;
  satisfiedCount: number;
  shortageCount: number;
  demands: MaterialDemand[];
}

@Injectable()
export class MaterialDemandService {
  constructor(
    @InjectRepository(MaterialDemand)
    private readonly repo: Repository<MaterialDemand>,
  ) {}

  async findAll(): Promise<MaterialDemand[]> {
    return this.repo.find({ order: { plannedDate: 'ASC' } });
  }

  async findByWorkOrder(workOrderId: string): Promise<MaterialDemand[]> {
    return this.repo.find({ where: { workOrderId }, order: { material: 'ASC' } });
  }

  /**
   * 查找所有短缺物料
   */
  async findShortages(): Promise<MaterialDemand[]> {
    return this.repo.find({
      where: { status: 'short' },
      order: { plannedDate: 'ASC' },
    });
  }

  /**
   * 创建单条物料需求
   */
  async create(data: {
    workOrderId: string;
    bomItemId?: string;
    material: string;
    spec?: string;
    requiredQty: number;
    availableQty: number;
    unit: string;
    plannedDate?: string;
  }): Promise<MaterialDemand> {
    const shortageQty = Math.max(0, data.requiredQty - data.availableQty);
    const status = shortageQty > 0 ? 'short' : 'satisfied';

    const entity = this.repo.create({
      workOrderId: data.workOrderId,
      bomItemId: data.bomItemId ?? null,
      material: data.material,
      spec: data.spec ?? '',
      requiredQty: data.requiredQty,
      availableQty: data.availableQty,
      shortageQty,
      unit: data.unit,
      plannedDate: data.plannedDate ? new Date(data.plannedDate) : new Date(),
      status,
    } as any);
    return this.repo.save(entity) as unknown as MaterialDemand;
  }

  /**
   * MRP需求运算 (SRS §8.2)
   * 根据工单BOM展开物料需求，对比库存，生成缺料清单
   */
  async calculateMRP(workOrderId: string): Promise<MrpResult> {
    const demands = await this.findByWorkOrder(workOrderId);

    // 重新计算每个物料的缺料状态
    for (const d of demands) {
      const shortageQty = Math.max(0, Number(d.requiredQty) - Number(d.availableQty));
      d.shortageQty = shortageQty;
      d.status = shortageQty > 0 ? 'short' : 'satisfied';
    }
    await this.repo.save(demands);

    const satisfiedCount = demands.filter((d) => d.status === 'satisfied').length;
    const shortageCount = demands.filter((d) => d.status === 'short').length;

    return {
      workOrderId,
      totalMaterials: demands.length,
      satisfiedCount,
      shortageCount,
      demands,
    };
  }

  /**
   * 批量MRP运算 — 多个工单的物料需求汇总
   * 汇总所有工单的材料需求，合并相同物料，计算总需求 vs 可用库存
   */
  async calculateMRPBatch(workOrderIds: string[]): Promise<{
    summary: Array<{ material: string; spec: string; totalRequired: number; totalAvailable: number; totalShortage: number; unit: string }>;
    perOrder: MrpResult[];
  }> {
    const perOrder: MrpResult[] = [];
    for (const woId of workOrderIds) {
      perOrder.push(await this.calculateMRP(woId));
    }

    // 汇总合并相同物料
    const allDemands = perOrder.flatMap((r) => r.demands);
    const matMap = new Map<string, { material: string; spec: string; totalRequired: number; totalAvailable: number; totalShortage: number; unit: string }>();

    for (const d of allDemands) {
      const key = `${d.material}|${d.spec ?? ''}`;
      if (matMap.has(key)) {
        const m = matMap.get(key)!;
        m.totalRequired += Number(d.requiredQty);
        m.totalAvailable += Number(d.availableQty);
        m.totalShortage += Number(d.shortageQty);
      } else {
        matMap.set(key, {
          material: d.material,
          spec: d.spec ?? '',
          totalRequired: Number(d.requiredQty),
          totalAvailable: Number(d.availableQty),
          totalShortage: Number(d.shortageQty),
          unit: d.unit,
        });
      }
    }

    return {
      summary: Array.from(matMap.values()),
      perOrder,
    };
  }
}
