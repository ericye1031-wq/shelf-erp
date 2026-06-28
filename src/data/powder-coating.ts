/**
 * 喷塑表面处理参数库
 * ======================
 * 数据来源：喷塑参数参照表.xls
 *
 * 用于计算货架表面处理（喷塑/烤漆）的成本
 */

// ===== 类型定义 =====

export interface PowderColor {
  /** 颜色名称/RAL色号 */
  color: string;
  /** 基础单价 元/m² */
  basePrice: number;
  /** 最小膜厚 */
  minThickness: string;
  /** 工艺类型 */
  processType: string;
  /** 是否常用 */
  isStandard?: boolean;
}

export interface PowderCoatingConfig {
  /** 默认厚度范围 */
  defaultThicknessRange: string;
  /** 所有可用颜色 */
  colors: PowderColor[];
  /** 最大单件长度限制 m */
  maxPartLength: number;

  /**
   * 计算喷塑费用
   * @param surfaceAreaM2 喷塑面积 m²
   * @param colorIndex 颜色索引（默认0=灰白）
   * @param quantity 数量（批量折扣）
   */
  calcCost(surfaceAreaM2: number, colorIndex?: number, quantity?: number): number;
}

// ===== 喷塑参数常量 =====

export const POWDER_COATING_CONFIG: PowderCoatingConfig = {
  defaultThicknessRange: '60~80μm',
  maxPartLength: 12, // 米

  colors: [
    // --- 标准色（常用，无需加价）---
    { color: 'RAL9002 灰白', basePrice: 2.80, minThickness: '≥60μm', processType: '静电喷涂', isStandard: true },
    { color: 'RAL9010 纯白', basePrice: 2.80, minThickness: '≥60μm', processType: '静电喷涂', isStandard: true },
    { color: 'RAL9005 黑', basePrice: 3.00, minThickness: '≥60μm', processType: '静电喷涂', isStandard: true },
    // --- 彩色（略加价）---
    { color: 'RAL5005 蓝', basePrice: 3.00, minThickness: '≥60μm', processType: '静电喷涂' },
    { color: 'RAL3020 红', basePrice: 3.20, minThickness: '≥60μm', processType: '静电喷涂' },
    { color: 'RAL6002 绿', basePrice: 3.00, minThickness: '≥60μm', processType: '静电喷涂' },
    { color: 'RAL1018 黄', basePrice: 3.20, minThickness: '≥60μm', processType: '静电喷涂' },
    { color: 'RAL5002 深蓝', basePrice: 3.10, minThickness: '≥60μm', processType: '静电喷涂' },
    { color: '橙色', basePrice: 3.50, minThickness: '≥60μm', processType: '静电喷涂' },
    { color: 'RAL3001 红(信号红)', basePrice: 3.30, minThickness: '≥60μm', processType: '静电喷涂' },
  ],

  calcCost(surfaceAreaM2: number, colorIndex: number = 0, quantity: number = 1): number {
    const color = this.colors[colorIndex] || this.colors[0];
    let unitPrice = color.basePrice;

    // 批量折扣：超过100m²优惠5%，超过500m²优惠10%
    if (quantity > 500) unitPrice *= 0.90;
    else if (quantity > 100) unitPrice *= 0.95;

    // 最小起订量：不足50元按50元计
    const cost = surfaceAreaM2 * unitPrice;
    return Math.max(cost, 50);
  },
};

// ===== 表面处理工艺选项 =====

export interface SurfaceTreatmentOption {
  code: string;
  name: string;
  /** 基础单价 元/m² 或 元/kg */
  unitPrice: number;
  unit: 'm2' | 'kg' | 'ton';
  description: string;
}

export const SURFACE_TREATMENT_OPTIONS: SurfaceTreatmentOption[] = [
  {
    code: 'POWDER_STD',
    name: '标准喷塑',
    unitPrice: 2800,
    unit: 'ton',
    description: 'RAL9002灰白色, ≥60μm膜厚, 室内使用',
  },
  {
    code: 'POWDER_OUTDOOR',
    name: '户外喷塑',
    unitPrice: 3200,
    unit: 'ton',
    description: '聚酯粉末, ≥80μm膜厚, 抗紫外线',
  },
  {
    code: 'GALVANIZE',
    name: '热镀锌',
    unitPrice: 1800,
    unit: 'ton',
    description: '热浸镀锌, ≥60g/m²锌层, 户外防腐',
  },
  {
    code: 'GALV_POWDER',
    name: '镀锌+喷塑(复合)',
    unitPrice: 4200,
    unit: 'ton',
    description: '先热镀锌后喷塑, 最佳防腐性能',
  },
  {
    code: 'PAINT_OIL',
    name: '醇酸漆',
    unitPrice: 800,
    unit: 'ton',
    description: '普通油漆, 低成本方案',
  },
  {
    code: 'CHROME_PLATE',
    name: '镀铬/镀镍',
    unitPrice: 8500,
    unit: 'ton',
    description: '装饰性电镀, 仅适用于小件',
  },
  {
    code: 'RAW',
    name: '不处理(裸材)',
    unitPrice: 0,
    unit: 'ton',
    description: '仅除油去锈, 不做表面处理',
  },
];
