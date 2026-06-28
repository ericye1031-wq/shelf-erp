import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShelfConfig } from '../shelf-configs/shelf-config.entity';
import { ShelfType } from '../shelf-types/shelf-type.entity';
import { Specification, StructureNode } from '../specifications/specification.entity';
import { BomItem } from './bom-item.entity';
import { evaluateFormula } from '../../common/utils/formula-parser.util';
import { BomCalculationResultDto, BomItemResultDto } from './dto/bom-calculator.dto';

/** 材料单价映射（简化版，后续从数据库/配置读取） */
const MATERIAL_UNIT_COST: Record<string, { weight: number; cost: number; unit: string }> = {
  'Q235': { weight: 7.85, cost: 5.0, unit: 'kg' },
  'Q345': { weight: 7.85, cost: 5.5, unit: 'kg' },
  'Q235B': { weight: 7.85, cost: 5.2, unit: 'kg' },
  'SS400': { weight: 7.85, cost: 5.3, unit: 'kg' },
  'steel': { weight: 7.85, cost: 5.0, unit: 'kg' },
  'aluminum': { weight: 2.7, cost: 18.0, unit: 'kg' },
  'wood': { weight: 0.6, cost: 3.0, unit: 'kg' },
};

@Injectable()
export class BomCalculatorService {
  constructor(
    @InjectRepository(ShelfConfig)
    private readonly configRepo: Repository<ShelfConfig>,
    @InjectRepository(ShelfType)
    private readonly shelfTypeRepo: Repository<ShelfType>,
    @InjectRepository(Specification)
    private readonly specRepo: Repository<Specification>,
    @InjectRepository(BomItem)
    private readonly bomItemRepo: Repository<BomItem>,
  ) {}

  /**
   * BOM计算核心方法
   * 流程：
   * 1. 获取货架配置参数
   * 2. 匹配最佳规格
   * 3. 遍历结构模板，用公式引擎计算每个节点
   * 4. 返回BOM结果
   */
  async calculateBom(configId: string): Promise<BomCalculationResultDto> {
    // 1. 获取配置
    const config = await this.configRepo.findOne({ where: { id: configId } });
    if (!config) throw new NotFoundException(`货架配置 ${configId} 不存在`);

    // 2. 匹配规格
    const specs = await this.specRepo.find({
      where: { shelfTypeId: config.shelfTypeId },
    });
    const spec = this.matchSpecification(specs, config.parameters ?? {});
    if (!spec) throw new NotFoundException(`未找到匹配的规格，货架类型 ${config.shelfTypeId}`);

    // 3. 参数转为数字（公式引擎需要number类型）
    const numericParams = this.toNumericParams(config.parameters ?? {});

    // 4. 遍历结构模板计算BOM
    const items = this.calculateStructureNodes(
      spec.structureTemplate ?? [],
      numericParams,
    );

    // 5. 汇总
    const totalMaterialCost = items.reduce((sum, item) => sum + (item.totalCost ?? 0), 0);

    // 6. 保存BOM项到数据库
    await this.saveBomItems(configId, items);

    return {
      configId: config.id,
      configName: config.name,
      specificationId: spec.id,
      specificationName: spec.name,
      parameters: config.parameters ?? {},
      items,
      totalMaterialCost,
      totalItems: items.length,
    };
  }

  /**
   * 规格匹配算法
   */
  private matchSpecification(
    specs: Specification[],
    parameters: Record<string, string | number>,
  ): Specification | null {
    let bestMatch: Specification | null = null;
    let bestScore = -1;

    for (const spec of specs) {
      const constraints = spec.parameterConstraints ?? {};
      let score = 0;
      let matched = true;

      for (const [key, constraint] of Object.entries(constraints)) {
        const paramValue = parameters[key];
        if (paramValue === undefined) {
          matched = false;
          break;
        }
        const numValue = typeof paramValue === 'number' ? paramValue : parseFloat(String(paramValue));
        const constraintObj = constraint as Record<string, unknown>;
        const min = constraintObj['min'] as number | undefined;
        const max = constraintObj['max'] as number | undefined;

        if (min !== undefined && numValue < min) { matched = false; break; }
        if (max !== undefined && numValue > max) { matched = false; break; }
        score++;
      }

      if (matched && score > bestScore) {
        bestScore = score;
        bestMatch = spec;
      }
    }

    return bestMatch;
  }

  /**
   * 递归计算结构模板节点
   */
  private calculateStructureNodes(
    nodes: StructureNode[],
    params: Record<string, number>,
    parentPartCode?: string,
  ): BomItemResultDto[] {
    const results: BomItemResultDto[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const result = this.calculateSingleNode(node, params, i);
      results.push(result);
    }

    return results;
  }

  /**
   * 计算单个BOM节点
   */
  private calculateSingleNode(
    node: StructureNode,
    params: Record<string, number>,
    index: number,
  ): BomItemResultDto {
    // 计算数量
    let quantity = 0;
    try {
      quantity = evaluateFormula(node.quantityFormula, params);
    } catch {
      quantity = 0;
    }

    // 计算长度
    let length: number | undefined;
    if (node.lengthFormula) {
      try {
        length = evaluateFormula(node.lengthFormula, params);
      } catch {
        length = undefined;
      }
    }

    // 获取材料信息
    const materialInfo = this.getMaterialInfo(node.material);
    const wasteRate = node.wasteRate ?? 0;

    // 计算总成本 = 数量 * 长度 * 单位重量 * 单价 * (1 + 损耗率)
    let totalCost = 0;
    if (materialInfo && quantity > 0) {
      const effectiveLength = length ?? 1;
      totalCost = quantity * effectiveLength * materialInfo.weight * materialInfo.cost * (1 + wasteRate);
    }

    // 递归计算子节点
    let children: BomItemResultDto[] | undefined;
    if (node.children && node.children.length > 0) {
      children = this.calculateStructureNodes(node.children, params, node.partCode);
      // 子节点成本加到当前节点
      const childrenCost = children.reduce((sum, c) => sum + (c.totalCost ?? 0), 0);
      totalCost += childrenCost;
    }

    return {
      partCode: node.partCode,
      partName: node.partName,
      material: node.material,
      quantity,
      length,
      unit: node.unit ?? materialInfo?.unit ?? 'pcs',
      unitWeight: materialInfo?.weight,
      unitCost: materialInfo?.cost,
      wasteRate,
      totalCost: Math.round(totalCost * 100) / 100,
      category: this.inferCategory(node.partCode, node.partName),
      children,
    };
  }

  /**
   * 获取材料信息
   */
  private getMaterialInfo(material?: string): { weight: number; cost: number; unit: string } | null {
    if (!material) return null;
    return MATERIAL_UNIT_COST[material] ?? null;
  }

  /**
   * 根据零件编码/名称推断分类
   */
  private inferCategory(partCode: string, partName: string): string {
    const name = partName.toLowerCase();
    const code = partCode.toLowerCase();

    if (name.includes('立柱') || code.includes('lz') || code.includes('upright')) return 'upright';
    if (name.includes('横梁') || code.includes('hl') || code.includes('beam')) return 'beam';
    if (name.includes('层板') || code.includes('cb') || code.includes('shelf')) return 'shelf-board';
    if (name.includes('加强') || code.includes('jq') || code.includes('brace')) return 'brace';
    if (name.includes('螺栓') || code.includes('ls') || code.includes('bolt')) return 'fastener';
    if (name.includes('背') || code.includes('bb') || code.includes('back')) return 'back-panel';
    return 'other';
  }

  /**
   * 将参数值转为数字
   */
  private toNumericParams(params: Record<string, string | number>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(params)) {
      result[key] = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    }
    return result;
  }

  /**
   * 保存BOM项到数据库
   */
  private async saveBomItems(configId: string, items: BomItemResultDto[]): Promise<void> {
    // 先删除旧的BOM项
    await this.bomItemRepo.delete({ bomId: configId });

    // 批量插入
    const entities = items.map((item, index) =>
      this.bomItemRepo.create({
        bomId: configId,
        partCode: item.partCode,
        partName: item.partName,
        material: item.material,
        quantity: item.quantity,
        length: item.length,
        unit: item.unit,
        unitWeight: item.unitWeight,
        unitCost: item.unitCost,
        wasteRate: item.wasteRate ?? 0,
        totalCost: item.totalCost ?? 0,
        category: item.category,
        sortOrder: index,
        parentId: null,
      }),
    );

    await this.bomItemRepo.save(entities);
  }
}
