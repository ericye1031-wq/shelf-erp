/**
 * 材料数据服务层
 * =================
 * 封装 src/data/ 下的型材规格、配件、喷塑数据，
 * 提供统一的查询接口供 BOM 计算器、产品管理、报价等模块使用。
 */

import {
  COLUMN_PROFILES,
  BEAM_PROFILES,
  BRACING_PROFILES,
  findColumnProfile,
  findBeamProfile,
  getColumnSpecsBySeries,
  type ColumnProfile,
  type BeamProfile,
  type BracingProfile,
} from '@/data/material-profiles';

import {
  BOLT_SPECS,
  CONNECTOR_SPECS,
  AISLE_RACK_PARTS,
  findBolt,
  getBoltsByType,
  calcBoltCost,
  type BoltSpec,
  type ConnectorSpec,
  type BoltType,
} from '@/data/accessories';

import {
  POWDER_COATING_CONFIG,
  SURFACE_TREATMENT_OPTIONS,
  type PowderColor,
  type SurfaceTreatmentOption,
} from '@/data/powder-coating';

import {
  STEEL_DENSITY,
  WASTE_RATES,
  PROCESSING_COSTS,
  STEEL_PRICES,
  SHELF_SERIES,
  COST_FORMULAS,
  MARGIN_RATES,
} from '@/data';

// ============================================================
// 型材查询服务
// ============================================================

/**
 * 按系列查询立柱型材
 * @param series 系列: 'SQ' | 'HD' | 'RD'
 */
export function getColumnProfilesBySeries(series: ColumnProfile['series']): ColumnProfile[] {
  return COLUMN_PROFILES.filter((p) => p.series === series);
}

/**
 * 按系列查询横梁型材
 * @param series 横梁系列如 'B50', 'B40', 'P', 'C'
 */
export function getBeamProfilesBySeries(series: string): BeamProfile[] {
  return BEAM_PROFILES.filter((p) => p.series === series);
}

/**
 * 按截面类型查询斜撑/拉杆
 */
export function getBracingsBySectionType(sectionType: BracingProfile['sectionType']): BracingProfile[] {
  return BRACING_PROFILES.filter((p) => p.sectionType === sectionType);
}

/**
 * 获取立柱规格字符串列表（按系列）— 供下拉选择器使用
 */
export function getColumnSpecOptions(series: string): string[] {
  return getColumnSpecsBySeries(series);
}

/**
 * 获取横梁规格字符串列表（按系列）— 供下拉选择器使用
 */
export function getBeamSpecOptions(series: string): string[] {
  return BEAM_PROFILES.filter((p) => p.series === series).map((p) => p.spec);
}

/**
 * 按规格字符串查询单位重量 (kg/m)
 * 自动判断立柱还是横梁
 */
export function getWeightPerMeterBySpec(spec: string): number {
  const column = findColumnProfile(spec);
  if (column) return column.weightPerMeter;

  const beam = findBeamProfile(spec);
  if (beam) return beam.weightPerMeter;

  const bracing = BRACING_PROFILES.find((p) => p.spec === spec);
  if (bracing) return bracing.weightPerMeter;

  return 0;
}

/**
 * 按规格字符串查询表面积 (m²/m)
 */
export function getSurfaceAreaPerMeterBySpec(spec: string): number {
  const column = findColumnProfile(spec);
  if (column) return column.surfaceAreaPerMeter;

  const beam = findBeamProfile(spec);
  if (beam) return beam.surfaceAreaPerMeter;

  return 0;
}

/**
 * 获取所有立柱系列选项（用于下拉选择器）
 */
export function getColumnSeriesOptions(): Array<{ label: string; value: string }> {
  const seriesMap: Record<string, string> = {
    SQ: 'SQ (标准型)',
    HD: 'HD (重型)',
    RD: 'RD (轻型)',
  };
  return Object.keys(seriesMap).map((s) => ({ label: seriesMap[s], value: s }));
}

/**
 * 获取所有横梁系列选项
 */
export function getBeamSeriesOptions(): Array<{ label: string; value: string }> {
  const seriesSet = new Set(BEAM_PROFILES.map((p) => p.series));
  return Array.from(seriesSet).map((s) => ({
    label: s === 'B50' ? '50高横梁' : s === 'B40' ? '40高横梁' : s === 'P' ? 'P型梁' : s === 'C' ? 'C型梁' : s,
    value: s,
  }));
}

/**
 * 获取所有斜撑截面类型选项
 */
export function getBracingSectionTypeOptions(): Array<{ label: string; value: string }> {
  const typeMap: Record<BracingProfile['sectionType'], string> = {
    angle: '角钢',
    square_tube: '方管',
    round_tube: '圆管',
    flat_bar: '扁钢',
  };
  const typeSet = new Set(BRACING_PROFILES.map((p) => p.sectionType));
  return Array.from(typeSet).map((t) => ({ label: typeMap[t], value: t }));
}

// ============================================================
// 配件查询服务
// ============================================================

/**
 * 按类型查询螺栓规格
 */
export function getBoltSpecsByType(type: BoltType): BoltSpec[] {
  return getBoltsByType(type);
}

/**
 * 查询单个螺栓规格
 */
export function getBoltSpec(type: BoltType, spec: string): BoltSpec | undefined {
  return findBolt(type, spec);
}

/**
 * 获取螺栓类型选项
 */
export function getBoltTypeOptions(): Array<{ label: string; value: BoltType }> {
  const typeMap: Record<BoltType, string> = {
    hex_bolt: '六角螺栓',
    flange_bolt: '法兰螺栓',
    strong_flange: '加强法兰螺栓',
    hex_nut: '六角螺母',
    flange_nut: '法兰螺母',
    lock_washer: '防松垫圈',
  };
  return (Object.keys(typeMap) as BoltType[]).map((t) => ({ label: typeMap[t], value: t }));
}

/**
 * 按名称查询连接件
 */
export function getConnectorsByName(name: string): ConnectorSpec[] {
  return [...CONNECTOR_SPECS, ...AISLE_RACK_PARTS].filter((c) => c.name === name);
}

/**
 * 获取所有连接件名称（去重）
 */
export function getConnectorNameOptions(): string[] {
  const nameSet = new Set([...CONNECTOR_SPECS, ...AISLE_RACK_PARTS].map((c) => c.name));
  return Array.from(nameSet).sort();
}

/**
 * 计算配件总成本
 */
export function calcAccessoryCost(
  bolts: Array<{ type: BoltType; spec: string; qty: number }>,
  connectors: Array<{ name: string; spec: string; qty: number }>,
): { totalWeight: number; totalPrice: number } {
  const boltResult = calcBoltCost(bolts);

  let connectorWeight = 0;
  let connectorPrice = 0;
  for (const item of connectors) {
    const connector = [...CONNECTOR_SPECS, ...AISLE_RACK_PARTS].find(
      (c) => c.name === item.name && c.spec === item.spec,
    );
    if (connector) {
      connectorWeight += connector.weight * item.qty;
      connectorPrice += connector.price * item.qty;
    }
  }

  return {
    totalWeight: Math.round((boltResult.totalWeight + connectorWeight) * 1000) / 1000,
    totalPrice: Math.round((boltResult.totalPrice + connectorPrice) * 100) / 100,
  };
}

/**
 * 获取通廊货架专用配件
 */
export function getAisleRackParts(): ConnectorSpec[] {
  return AISLE_RACK_PARTS;
}

// ============================================================
// 表面处理查询服务
// ============================================================

/**
 * 获取所有喷塑颜色选项
 */
export function getPowderColorOptions(): Array<{ label: string; value: number }> {
  return POWDER_COATING_CONFIG.colors.map((c, idx) => ({
    label: `${c.color} (${c.basePrice.toFixed(2)}元/m²)`,
    value: idx,
  }));
}

/**
 * 获取标准色（常用）喷塑颜色
 */
export function getStandardPowderColors(): PowderColor[] {
  return POWDER_COATING_CONFIG.colors.filter((c) => c.isStandard);
}

/**
 * 获取表面处理工艺选项
 */
export function getSurfaceTreatmentOptions(): SurfaceTreatmentOption[] {
  return SURFACE_TREATMENT_OPTIONS;
}

/**
 * 计算喷塑费用
 * @param surfaceAreaM2 喷塑面积 m²
 * @param colorIndex 颜色索引（默认0=灰白）
 * @param quantity 数量（批量折扣）
 */
export function calcPowderCoatingCost(
  surfaceAreaM2: number,
  colorIndex: number = 0,
  quantity: number = 1,
): number {
  return POWDER_COATING_CONFIG.calcCost(surfaceAreaM2, colorIndex, quantity);
}

/**
 * 按表面处理代码查询单价
 */
export function getSurfaceTreatmentPrice(code: string): SurfaceTreatmentOption | undefined {
  return SURFACE_TREATMENT_OPTIONS.find((o) => o.code === code);
}

/**
 * 计算表面处理总费用（按面积计价）
 */
export function calcSurfaceTreatmentCostByArea(
  surfaceAreaM2: number,
  colorIndex: number = 0,
  quantity: number = 1,
): number {
  return calcPowderCoatingCost(surfaceAreaM2, colorIndex, quantity);
}

/**
 * 计算表面处理总费用（按吨计价）
 */
export function calcSurfaceTreatmentCostByWeight(weightKg: number, code: string): number {
  const option = getSurfaceTreatmentPrice(code);
  if (!option) return 0;
  const weightTons = weightKg / 1000;
  return Math.round(weightTons * option.unitPrice * 100) / 100;
}

// ============================================================
// 成本常量查询服务
// ============================================================

/**
 * 获取钢材密度
 */
export function getSteelDensity(material: keyof typeof STEEL_DENSITY = 'Q235'): number {
  return STEEL_DENSITY[material] ?? STEEL_DENSITY.Q235;
}

/**
 * 获取钢材价格
 */
export function getSteelPrice(key: keyof typeof STEEL_PRICES): number {
  return STEEL_PRICES[key] ?? STEEL_PRICES.hrc_Q235;
}

/**
 * 获取损耗率
 */
export function getWasteRate(key: keyof typeof WASTE_RATES): number {
  return WASTE_RATES[key] ?? 0.03;
}

/**
 * 获取加工费率
 */
export function getProcessingCost(key: keyof typeof PROCESSING_COSTS): number {
  return PROCESSING_COSTS[key] ?? 0;
}

/**
 * 获取利润率
 */
export function getMarginRate(key: keyof typeof MARGIN_RATES = 'normal'): number {
  return MARGIN_RATES[key] ?? MARGIN_RATES.normal;
}

/**
 * 获取货架系列定义
 */
export function getShelfSeries(key: keyof typeof SHELF_SERIES) {
  return SHELF_SERIES[key];
}

/**
 * 获取所有货架系列选项
 */
export function getShelfSeriesOptions(): Array<{ label: string; value: string }> {
  return (Object.keys(SHELF_SERIES) as Array<keyof typeof SHELF_SERIES>).map((key) => ({
    label: SHELF_SERIES[key].name,
    value: SHELF_SERIES[key].code,
  }));
}

// ============================================================
// BOM 综合计算辅助
// ============================================================

/**
 * 根据型材规格和长度计算单件重量
 */
export function calcProfileWeight(spec: string, lengthM: number): number {
  const weightPerMeter = getWeightPerMeterBySpec(spec);
  return Math.round(weightPerMeter * lengthM * 100) / 100;
}

/**
 * 根据型材规格和长度计算单件表面积
 */
export function calcProfileSurfaceArea(spec: string, lengthM: number): number {
  const surfaceAreaPerMeter = getSurfaceAreaPerMeterBySpec(spec);
  return Math.round(surfaceAreaPerMeter * lengthM * 10000) / 10000;
}

/**
 * 计算型材材料成本
 */
export function calcProfileMaterialCost(
  spec: string,
  lengthM: number,
  quantity: number,
  steelPriceKey: keyof typeof STEEL_PRICES = 'hrc_Q235',
  wasteRateKey: keyof typeof WASTE_RATES = 'column',
): { weight: number; surfaceArea: number; materialCost: number } {
  const weightPerMeter = getWeightPerMeterBySpec(spec);
  const surfaceAreaPerMeter = getSurfaceAreaPerMeterBySpec(spec);

  const unitWeight = weightPerMeter * lengthM;
  const wasteRate = getWasteRate(wasteRateKey);
  const totalWeight = unitWeight * quantity * (1 + wasteRate);
  const steelPrice = getSteelPrice(steelPriceKey);
  const materialCost = (totalWeight / 1000) * steelPrice;

  return {
    weight: Math.round(totalWeight * 100) / 100,
    surfaceArea: Math.round(surfaceAreaPerMeter * lengthM * quantity * 10000) / 10000,
    materialCost: Math.round(materialCost * 100) / 100,
  };
}

// ============================================================
// 综合服务对象（兼容对象式调用）
// ============================================================

export const materialDataService = {
  // 型材
  getAllColumnProfiles: () => COLUMN_PROFILES,
  getColumnBySpec: (spec: string) => findColumnProfile(spec),
  getColumnSpecsBySeries: (series: string) => getColumnSpecsBySeries(series),
  getColumnByThickness: (series: string, minThickness: number, maxThickness?: number) =>
    COLUMN_PROFILES.filter(
      (p) => p.series === series && p.thickness >= minThickness && (!maxThickness || p.thickness <= maxThickness),
    ),
  recommendColumn: (loadKg: number) =>
    COLUMN_PROFILES.filter((p) => (p.maxLoad ?? 0) >= loadKg).sort((a, b) => (a.maxLoad ?? 0) - (b.maxLoad ?? 0)),
  getAllBeamProfiles: () => BEAM_PROFILES,
  getBeamBySpec: (spec: string) => findBeamProfile(spec),
  getBeamsBySeries: (series: string) => BEAM_PROFILES.filter((b) => b.series === series),
  recommendBeam: (spanMm: number, loadKg: number) => {
    const minInertia = (spanMm * loadKg) / 50000;
    return BEAM_PROFILES.filter((b) => (b.inertiaI ?? 0) >= minInertia).sort(
      (a, b) => (a.inertiaI ?? 0) - (b.inertiaI ?? 0),
    );
  },
  getAllBracingProfiles: () => BRACING_PROFILES,
  getBracingByName: (name: string) => BRACING_PROFILES.filter((b) => b.name === name),

  // 配件
  getAllBolts: () => BOLT_SPECS,
  getBolts: (type: BoltType) => getBoltsByType(type),
  getBolt: (type: BoltType, spec: string) => findBolt(type, spec),
  calcBoltSetCost: (items: Array<{ type: BoltType; spec: string; qty: number }>) => calcBoltCost(items),
  getAllConnectors: () => [...CONNECTOR_SPECS, ...AISLE_RACK_PARTS],
  getConnectorsByNameFn: (name: string) => [...CONNECTOR_SPECS, ...AISLE_RACK_PARTS].filter((c) => c.name === name),

  // 喷塑
  getPowderColors: () => POWDER_COATING_CONFIG.colors,
  getStandardColors: () => POWDER_COATING_CONFIG.colors.filter((c) => c.isStandard),
  calcPowderCost: (surfaceAreaM2: number, colorIndex: number = 0, quantity: number = 1) =>
    POWDER_COATING_CONFIG.calcCost(surfaceAreaM2, colorIndex, quantity),
  getSurfaceTreatmentOptionsFn: () => SURFACE_TREATMENT_OPTIONS,
  getSurfaceTreatment: (code: string) => SURFACE_TREATMENT_OPTIONS.find((o) => o.code === code),

  // 常量
  getSteelDensityFn: (grade: keyof typeof STEEL_DENSITY = 'Q235') => STEEL_DENSITY[grade],
  getWasteRateFn: (category: keyof typeof WASTE_RATES) => WASTE_RATES[category],
  getProcessingCostFn: (key: keyof typeof PROCESSING_COSTS) => PROCESSING_COSTS[key],
  getSteelPriceFn: (key: keyof typeof STEEL_PRICES) => STEEL_PRICES[key],
  getShelfSeriesFn: (key: keyof typeof SHELF_SERIES) => SHELF_SERIES[key],
  getCostFormula: (key: keyof typeof COST_FORMULAS) => COST_FORMULAS[key],
  getMarginRateFn: (key: keyof typeof MARGIN_RATES) => MARGIN_RATES[key],

  // 综合计算
  calcMaterialCost: (
    weightPerMeter: number,
    lengthM: number,
    quantity: number,
    steelPrice: number,
    wasteRate: number,
  ) => {
    const unitWeight = weightPerMeter * lengthM;
    const totalWeight = unitWeight * quantity * (1 + wasteRate);
    const cost = (totalWeight / 1000) * steelPrice;
    return { weight: Math.round(totalWeight * 100) / 100, cost: Math.round(cost * 100) / 100 };
  },
  calcSurfaceTreatmentCost: (surfaceAreaM2: number, treatmentCode: string, weightKg: number) => {
    const option = SURFACE_TREATMENT_OPTIONS.find((o) => o.code === treatmentCode);
    if (!option || option.unitPrice === 0) return 0;
    if (option.unit === 'm2') return Math.round(surfaceAreaM2 * option.unitPrice * 100) / 100;
    if (option.unit === 'ton') return Math.round((weightKg / 1000) * option.unitPrice * 100) / 100;
    if (option.unit === 'kg') return Math.round(weightKg * option.unitPrice * 100) / 100;
    return 0;
  },
} as const;

export type MaterialDataService = typeof materialDataService;

// 重新导出类型
export type { BoltType } from '@/data/accessories';
export type { ColumnProfile, BeamProfile, BracingProfile } from '@/data/material-profiles';
