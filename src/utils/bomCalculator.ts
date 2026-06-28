import type { ShelfConfig, ShelfType, Specification, BomCalcResult, BomCalcItem, StructureNode, SpecMatchResult, ParameterDef } from '@/types/m04';
import { materialDataService } from '@/services/material-data.service';
import {
  findColumnProfile,
  findBeamProfile,
  BRACING_PROFILES,
} from '@/data/material-profiles';
import { findBolt, BOLT_SPECS, CONNECTOR_SPECS } from '@/data/accessories';
import {
  POWDER_COATING_CONFIG,
  SURFACE_TREATMENT_OPTIONS,
} from '@/data/powder-coating';
import {
  STEEL_PRICES,
  WASTE_RATES,
  PROCESSING_COSTS,
  STEEL_DENSITY,
} from '@/data';

/**
 * BOM五步法计算引擎（集成真实型材数据库）
 * 1. 参数解析 → 解析配置参数与类型模板
 * 2. 规格匹配 → 匹配规格定义
 * 3. 结构展开 → 按结构模板展开BOM（从型材数据库获取重量/表面积）
 * 4. 配件计算 → 从配件数据库计算螺栓、销钉等配件
 * 5. 损耗追加 → 按损耗率追加材料
 */

/** 步骤1：参数解析 */
function parseParameters(
  parameters: Record<string, string | number>,
  template: ParameterDef[],
): Record<string, number> {
  const parsed: Record<string, number> = {};
  for (const def of template) {
    const raw = parameters[def.key];
    const num = Number(raw);
    parsed[def.key] = isNaN(num) ? Number(def.defaultValue) || 0 : num;
  }
  return parsed;
}

/** 简易公式求值器（支持基础四则运算和参数引用） */
function evalFormula(formula: string, params: Record<string, number>): number {
  try {
    const expr = formula.replace(/[a-zA-Z_]\w*/g, (match) => {
      return params[match] !== undefined ? String(params[match]) : '0';
    });
    // 安全求值：仅允许数字和运算符
    if (/^[\d\s+\-*/().]+$/.test(expr)) {
      return new Function(`return (${expr})`)() as number;
    }
    return 0;
  } catch {
    return 0;
  }
}

/** 步骤2：规格匹配 */
function matchSpecifications(
  params: Record<string, number>,
  specs: Specification[],
): SpecMatchResult {
  for (const spec of specs) {
    let allMatched = true;
    const unmatchedParams: string[] = [];

    for (const [key, constraint] of Object.entries(spec.parameterConstraints)) {
      const value = params[key];
      if (value === undefined) {
        allMatched = false;
        unmatchedParams.push(key);
        continue;
      }
      if (constraint.min !== undefined && value < constraint.min) {
        allMatched = false;
        unmatchedParams.push(key);
      }
      if (constraint.max !== undefined && value > constraint.max) {
        allMatched = false;
        unmatchedParams.push(key);
      }
      if (constraint.values && !constraint.values.includes(String(value))) {
        allMatched = false;
        unmatchedParams.push(key);
      }
    }

    if (allMatched) {
      return { matched: true, specification: spec, unmatchedParams: [] };
    }

    return { matched: false, specification: spec, unmatchedParams };
  }

  return { matched: false, specification: null as any, unmatchedParams: Object.keys(params) };
}

/**
 * 从型材数据库查找单位重量和表面积
 * 优先按 partCode 匹配型材类型，再按 material 字段中的规格字符串匹配
 */
function lookupProfileData(node: StructureNode): {
  weightPerMeter: number;
  surfaceAreaPerMeter: number;
  profileSpec: string;
} {
  // 默认值（回退）
  const fallback = { weightPerMeter: 0, surfaceAreaPerMeter: 0, profileSpec: '' };

  // 尝试从 partCode 判断型材类型
  // P01 = 立柱, P02 = 横梁, P03 = 层板/面板, P04 = 斜撑
  if (node.partCode.includes('P01') || node.partCode.includes('COL')) {
    // 立柱：尝试从 material 字段提取规格，或使用默认
    const specMatch = node.material?.match(/(\d+[\*x]\d+[\*x]\d+\.?\d*)/i);
    if (specMatch) {
      const profile = findColumnProfile(specMatch[1]);
      if (profile) {
        return {
          weightPerMeter: profile.weightPerMeter,
          surfaceAreaPerMeter: profile.surfaceAreaPerMeter,
          profileSpec: profile.spec,
        };
      }
    }
    // 默认：SQ 90*70*2.0
    const defaultCol = findColumnProfile('90*70*2.0');
    if (defaultCol) {
      return {
        weightPerMeter: defaultCol.weightPerMeter,
        surfaceAreaPerMeter: defaultCol.surfaceAreaPerMeter,
        profileSpec: defaultCol.spec,
      };
    }
    return { ...fallback, weightPerMeter: 3.93, surfaceAreaPerMeter: 0.498 };
  }

  if (node.partCode.includes('P02') || node.partCode.includes('BEAM')) {
    // 横梁
    const specMatch = node.material?.match(/(\d+[\*x]\d+[\*x]\d+\.?\d*)/i);
    if (specMatch) {
      const profile = findBeamProfile(specMatch[1]);
      if (profile) {
        return {
          weightPerMeter: profile.weightPerMeter,
          surfaceAreaPerMeter: profile.surfaceAreaPerMeter,
          profileSpec: profile.spec,
        };
      }
    }
    // 默认：B50 100*50*1.5
    const defaultBeam = findBeamProfile('100*50*1.5');
    if (defaultBeam) {
      return {
        weightPerMeter: defaultBeam.weightPerMeter,
        surfaceAreaPerMeter: defaultBeam.surfaceAreaPerMeter,
        profileSpec: defaultBeam.spec,
      };
    }
    return { ...fallback, weightPerMeter: 2.26, surfaceAreaPerMeter: 0.28 };
  }

  if (node.partCode.includes('P04') || node.partCode.includes('BRA')) {
    // 斜撑：从 BRACING_PROFILES 查找
    const specMatch = node.material?.match(/(\d+[\*x]\d+[\*x]\d+\.?\d*)/i);
    if (specMatch) {
      const bracing = BRACING_PROFILES.find(b => b.spec === specMatch[1]);
      if (bracing) {
        return {
          weightPerMeter: bracing.weightPerMeter,
          surfaceAreaPerMeter: 0.15, // 斜撑表面积估算
          profileSpec: bracing.spec,
        };
      }
    }
    // 默认：角铁 30*30*3.0
    const defaultBracing = BRACING_PROFILES.find(b => b.spec === '30*30*3.0');
    if (defaultBracing) {
      return {
        weightPerMeter: defaultBracing.weightPerMeter,
        surfaceAreaPerMeter: 0.15,
        profileSpec: defaultBracing.spec,
      };
    }
    return { ...fallback, weightPerMeter: 1.373, surfaceAreaPerMeter: 0.15 };
  }

  if (node.partCode.includes('P03') || node.partCode.includes('PAN')) {
    // 层板：按面积计算
    return { ...fallback, weightPerMeter: 0, surfaceAreaPerMeter: 0, profileSpec: 'panel' };
  }

  // 默认回退
  return { ...fallback, weightPerMeter: 3.0, surfaceAreaPerMeter: 0.3 };
}

/** 步骤3：结构展开 — 使用真实型材数据库 */
function expandStructureNode(
  node: StructureNode,
  params: Record<string, number>,
  level: number,
): BomCalcItem[] {
  const items: BomCalcItem[] = [];

  const quantity = Math.ceil(evalFormula(node.quantityFormula, params) || 0);
  const length = (evalFormula(node.lengthFormula ?? '', params) as number) || 0;

  // 从型材数据库获取真实重量和表面积
  const profileData = lookupProfileData(node);
  const weightPerMeter = profileData.weightPerMeter;
  const surfaceAreaPerMeter = profileData.surfaceAreaPerMeter;

  // 计算重量 (kg)
  const unitWeight = weightPerMeter * length; // kg/件
  const totalSurfaceArea = surfaceAreaPerMeter * length; // m²/件

  // 钢材单价（元/kg = 元/吨 / 1000）
  const steelPricePerKg = STEEL_PRICES.hrc_Q235 / 1000; // Q235B 热轧卷板

  // 材料成本
  const materialCost = unitWeight * steelPricePerKg;

  // 加工费（元/kg，简化：冲孔+切断+弯成型）
  const processingCostPerKg =
    (PROCESSING_COSTS.punching + PROCESSING_COSTS.cutting + PROCESSING_COSTS.bending) / 1000;
  const processingCost = unitWeight * processingCostPerKg;

  // 表面处理成本（标准喷塑）
  const surfaceCost = POWDER_COATING_CONFIG.calcCost(totalSurfaceArea, 0, quantity);

  const unitCost = materialCost + processingCost + surfaceCost / quantity;

  // 确定损耗率
  let wasteRate = WASTE_RATES.beam; // 默认横梁损耗
  if (node.partCode.includes('P01') || node.partCode.includes('COL')) {
    wasteRate = WASTE_RATES.column;
  } else if (node.partCode.includes('P03') || node.partCode.includes('PAN')) {
    wasteRate = WASTE_RATES.panel;
  } else if (node.partCode.includes('P04') || node.partCode.includes('BRA')) {
    wasteRate = WASTE_RATES.bracing;
  }

  items.push({
    partCode: node.partCode,
    partName: node.partName,
    material: node.material ?? '',
    spec: profileData.profileSpec || `${node.partCode}-${length.toFixed(2)}m`,
    quantity,
    unit: node.unit as string,
    length,
    unitWeight: Math.round(unitWeight * 100) / 100,
    weight: Math.round(unitWeight * 100) / 100,
    unitCost: Math.round(unitCost * 100) / 100,
    totalCost: Math.round(quantity * unitCost * 100) / 100,
    wasteRate,
    category: 'structural' as string,
    isAccessory: false,
  });

  if (node.children) {
    for (const child of node.children) {
      items.push(...expandStructureNode(child, params, level + 1));
    }
  }

  return items;
}

/** 步骤4：配件计算 — 使用真实配件数据库 */
function calcAccessories(_structureItems: BomCalcItem[], params: Record<string, number>): BomCalcItem[] {
  const accessories: BomCalcItem[] = [];
  const layers = params.layers ?? params.floors ?? 4;
  const columns = params.columns ?? 4; // 默认4根立柱
  const boltQty = Math.ceil(layers * columns);

  // 法兰螺栓 10*20（冲孔立柱专用）
  const boltSpec = findBolt('flange_bolt', '10*20');
  if (boltSpec) {
    accessories.push({
      partCode: 'ACC01',
      partName: `法兰螺栓${boltSpec.spec}`,
      material: '碳钢10.9级',
      spec: boltSpec.spec,
      quantity: boltQty,
      unit: '个',
      length: 0,
      unitWeight: boltSpec.weight,
      weight: boltSpec.weight,
      unitCost: boltSpec.price,
      totalCost: Math.round(boltQty * boltSpec.price * 100) / 100,
      wasteRate: WASTE_RATES.bolt,
      category: 'accessory',
      isAccessory: true,
    });
  }

  // 法兰螺母 M10
  const nutSpec = findBolt('flange_nut', 'M10');
  if (nutSpec) {
    accessories.push({
      partCode: 'ACC02',
      partName: `法兰螺母${nutSpec.spec}`,
      material: '碳钢8级',
      spec: nutSpec.spec,
      quantity: boltQty,
      unit: '个',
      length: 0,
      unitWeight: nutSpec.weight,
      weight: nutSpec.weight,
      unitCost: nutSpec.price,
      totalCost: Math.round(boltQty * nutSpec.price * 100) / 100,
      wasteRate: WASTE_RATES.bolt,
      category: 'accessory',
      isAccessory: true,
    });
  }

  // 安全销
  const safetyPin = CONNECTOR_SPECS.find(c => c.name === '安全销');
  if (safetyPin) {
    const pinQty = Math.ceil(layers * columns);
    accessories.push({
      partCode: 'ACC03',
      partName: safetyPin.name,
      material: '碳钢',
      spec: safetyPin.spec,
      quantity: pinQty,
      unit: '个',
      length: 0,
      unitWeight: safetyPin.weight,
      weight: safetyPin.weight,
      unitCost: safetyPin.price,
      totalCost: Math.round(pinQty * safetyPin.price * 100) / 100,
      wasteRate: WASTE_RATES.bolt,
      category: 'accessory',
      isAccessory: true,
    });
  }

  // 地脚板
  const footPlate = CONNECTOR_SPECS.find(c => c.name === '地脚板' && c.spec === '140*100*6');
  if (footPlate) {
    const footQty = columns;
    accessories.push({
      partCode: 'ACC04',
      partName: footPlate.name,
      material: 'Q235',
      spec: footPlate.spec,
      quantity: footQty,
      unit: '块',
      length: 0,
      unitWeight: footPlate.weight,
      weight: footPlate.weight,
      unitCost: footPlate.price,
      totalCost: Math.round(footQty * footPlate.price * 100) / 100,
      wasteRate: WASTE_RATES.packaging,
      category: 'accessory',
      isAccessory: true,
    });
  }

  return accessories;
}

/** 步骤5：损耗追加 — 使用真实损耗率 */
function appendWaste(items: BomCalcItem[], _params: Record<string, number>): BomCalcItem[] {
  return items.map((item) => {
    // 使用各项目已设定的 wasteRate，回退到默认值
    const wasteRate = item.wasteRate > 0 ? item.wasteRate : WASTE_RATES.beam;
    const wasteQty = Math.ceil(item.quantity * wasteRate);
    const totalQty = item.quantity + wasteQty;

    return {
      ...item,
      wasteRate,
      quantity: totalQty,
      totalCost: Math.round(totalQty * item.unitCost * 100) / 100,
    };
  });
}

/** 主计算入口 */
export function calculateBom(
  config: ShelfConfig,
  shelfType: ShelfType,
  specs: Specification[],
): BomCalcResult {
  // 步骤1：参数解析
  const parsed = parseParameters(config.parameters, shelfType.parameterTemplate);

  // 步骤2：规格匹配
  const specMatch = matchSpecifications(parsed, specs);

  // 步骤3：结构展开（使用真实型材数据）
  let structureItems: BomCalcItem[] = [];
  const matchedSpec = specs.find((s) => s.id === specMatch.specification?.id);
  if (matchedSpec) {
    for (const node of matchedSpec.structureTemplate) {
      structureItems.push(...expandStructureNode(node, parsed, 1));
    }
  }

  // 步骤4：配件计算（使用真实配件数据）
  const accessories = calcAccessories(structureItems, parsed);

  // 步骤5：损耗追加
  const allItems = [...structureItems, ...accessories];
  const withWaste = appendWaste(allItems, parsed);

  // 汇总
  const totalWeight = withWaste.reduce((sum, i) => sum + (i.weight ?? 0) * i.quantity, 0);
  const totalCost = withWaste.reduce((sum, i) => sum + i.totalCost, 0);

  // 表面处理总成本
  const totalSurfaceArea = withWaste
    .filter(i => !i.isAccessory)
    .reduce((sum, i) => {
      const profile = lookupProfileData({ partCode: i.partCode, partName: i.partName, material: i.material } as StructureNode);
      return sum + profile.surfaceAreaPerMeter * i.length * i.quantity;
    }, 0);

  return {
    configId: config.id,
    configName: config.name || '',
    specificationId: specMatch.specification?.id || '',
    specificationName: specMatch.specification?.name || '',
    shelfTypeName: shelfType.name,
    parameters: parsed,
    items: withWaste,
    totalWeight: Math.round(totalWeight * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    calculatedAt: new Date().toISOString(),
  };
}

/** 单独导出规格匹配供页面使用 */
export { matchSpecifications, parseParameters };
