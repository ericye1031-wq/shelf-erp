/**
 * 业务常量和基础数据
 * ====================
 * 数据来源：综合自多个资料文件
 *
 * 包含：钢材密度、损耗率、加工费率、钢材价格基准等
 */

// ===== 导出所有子模块 =====
export * from './material-profiles';
export * from './accessories';
export * from './powder-coating';

// ===== 钢材密度 t/m³ =====

export const STEEL_DENSITY = {
  Q235: 7.85,
  Q345: 7.85,
  SUS201: 7.93,
  SUS304: 7.93,
  SUS316: 7.98,
  AL_1100: 2.71,
  AL_3003: 2.73,
} as const;

/** 铝合金密度 t/m³ */
export const AL_DENSITY = 2.73;

// ===== 常用损耗率 =====

export const WASTE_RATES = {
  /** 立柱切割损耗（含两端修整）*/
  column: 0.03,
  /** 横梁切割损耗 */
  beam: 0.02,
  /** 斜撑/拉杆切割损耗 */
  bracing: 0.02,
  /** 层板加工损耗（裁剪+折边+冲孔）*/
  panel: 0.05,
  /** 螺栓备品率 */
  bolt: 0.01,
  /** 喷塑损耗（挂具+返工）*/
  powderCoat: 0.05,
  /** 包装材料损耗 */
  packaging: 0.02,
};

// ===== 加工费参考（2025年市场行情，单位：元/吨 或 元/件）=====

export const PROCESSING_COSTS = {
  /** 开卷/校平 元/吨 */
  uncoiling: 250,
  /** 冲孔 元/吨 */
  punching: 450,
  /** 切断 元/吨 */
  cutting: 350,
  /** 冷弯成型 元/吨 */
  bending: 550,
  /** 焊接 元/吨 */
  welding: 1800,
  /** 组装 元/吨 */
  assembly: 800,
  /** 打包/包装 元/吨 */
  packaging: 150,

  /** 喷塑（表面处理）元/吨 - 含前处理 */
  powderCoatingBase: 2800,
  powderCoatingOutdoor: 3200,
  /** 热镀锌 元/吨 */
  galvanize: 1800,

  /** 单项加工费 */
  /** 冲单个孔 元/孔 */
  perPunchHole: 0.08,
  /** 折边 元/米 */
  perFold: 1.5,
  /** 焊接点 元/点 */
  perWeldPoint: 0.55,
  /** 去毛刺 元/米 */
  deburring: 0.75,
} as const;

// ===== 钢材价格基准（不含税 元/吨，2025Q1参考价）=====

export const STEEL_PRICES = {
  /** 热轧卷板 Q235B */
  hrc_Q235: 4200,
  /** 冷轧卷板 SPCC */
  crc_SPCC: 4800,
  /** 镀锌卷 DX51D+Z */
  galv_DX51D: 5200,
  /** 不锈冷轧 304/2B */
  ss_304: 14500,
  /** 不锈冷轧 201/2B */
  ss_201: 7200,
  /** 铝板 3003-H14 */
  al_3003: 22500,
} as const;

// ===== 货架产品系列定义 =====

export const SHELF_SERIES = {
  /** 标准横梁式货架 */
  STANDARD_BEAM: {
    code: 'SB',
    name: '标准横梁式货架',
    loadLevel: [500, 800, 1000, 1500, 2000, 2500, 3000],
    heightOptions: [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000],
    depthOptions: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1500],
    columnSeries: ['SQ'],
  },
  /** 重型横梁式货架 */
  HEAVY_BEAM: {
    code: 'HB',
    name: '重型横梁式货架',
    loadLevel: [1500, 2000, 2500, 3000, 3500, 4000, 5000],
    heightOptions: [3000, 4000, 5000, 6000, 7500, 8000, 9000, 10000, 12000],
    depthOptions: [800, 900, 1000, 1100, 1200, 1300, 1500, 1800, 2000],
    columnSeries: ['HD'],
  },
  /** 阁楼式平台 */
  MEZZANINE: {
    code: 'MZ',
    name: '阁楼式货架平台',
    loadLevel: [300, 500, 800], // 楼面均布荷载 kg/m²
    heightOptions: [2500, 2700, 3000, 3500, 4000, 4500, 5000],
    depthOptions: [2000, 2500, 3000, 3500, 4000, 5000, 6000],
    columnSeries: ['SQ', 'HD'],
  },
  /** 贯通式/驶入式 */
  DRIVE_IN: {
    code: 'DI',
    name: '贯通式(驶入式)货架',
    loadLevel: [1000, 1500, 2000, 2500, 3000],
    heightOptions: [3000, 4000, 5000, 6000, 7500, 9000, 10000, 12000],
    depthOptions: [1200, 1350, 1500, 1700, 1900, 2100, 2400, 2700],
    columnSeries: ['HD'],
  },
  /** 穿梭车式 */
  SHUTTLE: {
    code: 'SH',
    name: '穿梭车货架',
    loadLevel: [1500, 2000, 2500, 3000],
    heightOptions: [4000, 5000, 6000, 7500],
    depthOptions: [2000, 2500, 3000, 3500, 4000, 5000],
    columnSeries: ['HD'],
  },
} as const;

// ===== 成本核算公式模板 =====

/** BOM成本计算核心公式 */
export const COST_FORMULAS = {
  /**
   * 材料成本 = Σ(长度 × 单位重量 × 单价 × (1 + 损耗率))
   */
  materialCost: 'length * unitWeight * unitPrice * (1 + wasteRate)',

  /**
   * 加工成本 = 材料总重 × 加工费率
   */
  processingCost: 'totalWeight * processingRate',

  /**
   * 表面处理成本 = 总表面积 × 喷塑单价
   */
  surfaceCost: 'totalSurfaceArea * powderUnitPrice',

  /**
   * 总成本 = 材料成本 + 加工成本 + 表面处理成本 + 配件成本
   */
  totalCost: 'materialCost + processingCost + surfaceCost + accessoryCost',

  /**
   * 报价 = 总成本 × (1 + 利润率)
   */
  quotationPrice: 'totalCost * (1 + marginRate)',
} as const;

/** 常用利润率参考 */
export const MARGIN_RATES = {
  low: 0.12,      // 竞争性报价
  normal: 0.18,    // 标准报价
  high: 0.25,      // 高利润报价
  custom: 0,       // 自定义
} as const;
