/**
 * 货架型材规格数据库
 * ===================
 * 数据来源：
 *   - 常用材料参数表.xls (08年11月版)
 *   - 货架计算表V2025.xlsx
 *   - 01常规货架数据参数V2022.xlsx
 *   - 货架材料参数总表.xlsx
 *   - 标准货架材料.xls
 *
 * 包含：立柱(SQ系列)、横梁(HD系列)、斜撑、P型梁、C型梁等型材的物理参数
 */

// ===== 类型定义 =====

/** 立柱/主柱型材规格 */
export interface ColumnProfile {
  /** 系列: SQ=标准, HD=重型, RD=轻型 */
  series: 'SQ' | 'HD' | 'RD';
  /** 规格如 '55*47*1.5' = 宽*深*厚度 */
  spec: string;
  /** 厚度 mm */
  thickness: number;
  /** 截面周长 mm */
  perimeter: number;
  /** 理论重量 kg/m */
  weightPerMeter: number;
  /** 喷塑表面积 m²/m */
  surfaceAreaPerMeter: number;
  /** 惯性矩 cm⁴ (可选) */
  inertiaI?: number;
  /** 单根最大承载 kg (可选) */
  maxLoad?: number;
}

/** 横梁型材规格 */
export interface BeamProfile {
  series: string;
  spec: string;
  thickness: number;
  perimeter: number;
  weightPerMeter: number;
  surfaceAreaPerMeter: number;
  /** 截面惯性矩 */
  inertiaI?: number;
}

/** 斜撑/拉杆规格 */
export interface BracingProfile {
  name: string;           // 如 '斜撑方管', '斜撑角铁', '十字拉杆'
  spec: string;
  weightPerMeter: number; // kg/m
  sectionType: 'angle' | 'square_tube' | 'round_tube' | 'flat_bar';
}

// ===== S系/SQ系列 立柱 (最常用，d=50~100mm) =====

export const COLUMN_PROFILES: ColumnProfile[] = [
  // --- S系55型 (内径d=50mm) ---
  { series: 'SQ', spec: '55*47*1.5', thickness: 1.5, perimeter: 146, weightPerMeter: 1.79, surfaceAreaPerMeter: 0.296 },
  { series: 'SQ', spec: '55*47*1.8', thickness: 1.8, perimeter: 146, weightPerMeter: 2.15, surfaceAreaPerMeter: 0.296 },
  { series: 'SQ', spec: '55*47*2.0', thickness: 2.0, perimeter: 146, weightPerMeter: 2.38, surfaceAreaPerMeter: 0.296 },

  // --- S系55宽型 ---
  { series: 'SQ', spec: '55*55*1.5', thickness: 1.5, perimeter: 175, weightPerMeter: 2.06, surfaceAreaPerMeter: 0.35 },
  { series: 'SQ', spec: '55*57*1.5', thickness: 1.5, perimeter: 182, weightPerMeter: 2.14, surfaceAreaPerMeter: 0.364 },
  { series: 'SQ', spec: '55*57*1.8', thickness: 1.8, perimeter: 182, weightPerMeter: 2.57, surfaceAreaPerMeter: 0.364 },
  { series: 'SQ', spec: '55*57*2.0', thickness: 2.0, perimeter: 182, weightPerMeter: 2.86, surfaceAreaPerMeter: 0.364 },

  // --- S系80型 (d=75mm) ---
  { series: 'SQ', spec: '80*60*1.5', thickness: 1.5, perimeter: 198, weightPerMeter: 2.38, surfaceAreaPerMeter: 0.396 },
  { series: 'SQ', spec: '80*60*1.8', thickness: 1.8, perimeter: 198, weightPerMeter: 2.85, surfaceAreaPerMeter: 0.396 },
  { series: 'SQ', spec: '80*60*2.0', thickness: 2.0, perimeter: 198, weightPerMeter: 3.17, surfaceAreaPerMeter: 0.396 },
  { series: 'SQ', spec: '80*60*2.5', thickness: 2.5, perimeter: 198, weightPerMeter: 3.93, surfaceAreaPerMeter: 0.396 },

  // --- S系90型 (d=75mm) ---
  { series: 'SQ', spec: '90*70*1.5', thickness: 1.5, perimeter: 249, weightPerMeter: 2.95, surfaceAreaPerMeter: 0.498 },
  { series: 'SQ', spec: '90*70*1.8', thickness: 1.8, perimeter: 249, weightPerMeter: 3.54, surfaceAreaPerMeter: 0.498 },
  { series: 'SQ', spec: '90*70*2.0', thickness: 2.0, perimeter: 249, weightPerMeter: 3.93, surfaceAreaPerMeter: 0.498 },
  { series: 'SQ', spec: '90*70*2.5', thickness: 2.5, perimeter: 249, weightPerMeter: 4.91, surfaceAreaPerMeter: 0.498 },
  // 90窄型
  { series: 'SQ', spec: '90*60*1.5', thickness: 1.5, perimeter: 210, weightPerMeter: 2.48, surfaceAreaPerMeter: 0.42 },
  { series: 'SQ', spec: '90*60*1.8', thickness: 1.8, perimeter: 210, weightPerMeter: 2.97, surfaceAreaPerMeter: 0.42 },
  { series: 'SQ', spec: '90*60*2.0', thickness: 2.0, perimeter: 210, weightPerMeter: 3.30, surfaceAreaPerMeter: 0.42 },

  // --- S系100型 (d=75mm) ---
  { series: 'SQ', spec: '100*70*2.0', thickness: 2.0, perimeter: 260, weightPerMeter: 4.08, surfaceAreaPerMeter: 0.52 },
  { series: 'SQ', spec: '100*70*2.3', thickness: 2.3, perimeter: 260, weightPerMeter: 4.69, surfaceAreaPerMeter: 0.52 },
  { series: 'SQ', spec: '100*70*2.5', thickness: 2.5, perimeter: 260, weightPerMeter: 5.10, surfaceAreaPerMeter: 0.52 },

  // --- S系120型 (d=100mm, 重载) ---
  { series: 'SQ', spec: '120*95*2.0', thickness: 2.0, perimeter: 335, weightPerMeter: 5.20, surfaceAreaPerMeter: 0.67 },
  { series: 'SQ', spec: '120*95*2.3', thickness: 2.3, perimeter: 335, weightPerMeter: 5.97, surfaceAreaPerMeter: 0.67 },
  { series: 'SQ', spec: '120*95*2.5', thickness: 2.5, perimeter: 335, weightPerMeter: 6.48, surfaceAreaPerMeter: 0.67 },

  // --- HD重型系列 ---
  { series: 'HD', spec: '85*67*1.6', thickness: 1.6, perimeter: 237, weightPerMeter: 2.93, surfaceAreaPerMeter: 0.47 },
  { series: 'HD', spec: '85*67*1.8', thickness: 1.8, perimeter: 237, weightPerMeter: 3.26, surfaceAreaPerMeter: 0.47 },
  { series: 'HD', spec: '85*67*2.0', thickness: 2.0, perimeter: 237, weightPerMeter: 3.59, surfaceAreaPerMeter: 0.47 },
  { series: 'HD', spec: '85*67*2.3', thickness: 2.3, perimeter: 237, weightPerMeter: 4.09, surfaceAreaPerMeter: 0.47 },
  { series: 'HD', spec: '100*67*1.6', thickness: 1.6, perimeter: 254, weightPerMeter: 3.25, surfaceAreaPerMeter: 0.51 },
  { series: 'HD', spec: '100*67*1.8', thickness: 1.8, perimeter: 254, weightPerMeter: 3.64, surfaceAreaPerMeter: 0.51 },
  { series: 'HD', spec: '100*67*2.0', thickness: 2.0, perimeter: 254, weightPerMeter: 4.03, surfaceAreaPerMeter: 0.51 },
  { series: 'HD', spec: '100*67*2.3', thickness: 2.3, perimeter: 254, weightPerMeter: 4.60, surfaceAreaPerMeter: 0.51 },
  { series: 'HD', spec: '100*95*2.0', thickness: 2.0, perimeter: 306, weightPerMeter: 4.80, surfaceAreaPerMeter: 0.61 },
  { series: 'HD', spec: '120*115*2.5', thickness: 2.5, perimeter: 380, weightPerMeter: 7.20, surfaceAreaPerMeter: 0.76 },
];

// ===== HD系列 横梁 =====

export const BEAM_PROFILES: BeamProfile[] = [
  // --- 50mm高横梁 ---
  { series: 'B50', spec: '80*50*1.5', thickness: 1.5, perimeter: 186, weightPerMeter: 2.04, surfaceAreaPerMeter: 0.26, inertiaI: 60.1 },
  { series: 'B50', spec: '100*50*1.5', thickness: 1.5, perimeter: 206, weightPerMeter: 2.26, surfaceAreaPerMeter: 0.28, inertiaI: 100.6 },
  { series: 'B50', spec: '110*50*1.5', thickness: 1.5, perimeter: 218, weightPerMeter: 2.39, surfaceAreaPerMeter: 0.29, inertiaI: 129.4 },
  { series: 'B50', spec: '120*50*1.5', thickness: 1.5, perimeter: 228, weightPerMeter: 2.51, surfaceAreaPerMeter: 0.30, inertiaI: 154.3 },
  { series: 'B50', spec: '140*50*1.5', thickness: 1.5, perimeter: 246, weightPerMeter: 2.71, surfaceAreaPerMeter: 0.32, inertiaI: 222.1 },
  { series: 'B50', spec: '160*50*1.5', thickness: 1.5, perimeter: 266, weightPerMeter: 2.93, surfaceAreaPerMeter: 0.34, inertiaI: 305.1 },
  { series: 'B50', spec: '160*50*2.0', thickness: 2.0, perimeter: 266, weightPerMeter: 3.87, surfaceAreaPerMeter: 0.34, inertiaI: 396.5 },
  { series: 'B50', spec: '160*50*2.3', thickness: 2.3, perimeter: 266, weightPerMeter: 4.43, surfaceAreaPerMeter: 0.34, inertiaI: 448.8 },

  // --- 40mm高横梁 ---
  { series: 'B40', spec: '80*40*1.5', thickness: 1.5, perimeter: 168, weightPerMeter: 1.78, surfaceAreaPerMeter: 0.23 },
  { series: 'B40', spec: '90*40*1.5', thickness: 1.5, perimeter: 178, weightPerMeter: 1.89, surfaceAreaPerMeter: 0.24 },
  { series: 'B40', spec: '100*40*1.5', thickness: 1.5, perimeter: 188, weightPerMeter: 2.00, surfaceAreaPerMeter: 0.25 },
  { series: 'B40', spec: '110*40*1.5', thickness: 1.5, perimeter: 198, weightPerMeter: 2.10, surfaceAreaPerMeter: 0.26 },
  { series: 'B40', spec: '120*40*1.5', thickness: 1.5, perimeter: 218, weightPerMeter: 2.20, surfaceAreaPerMeter: 0.27 },
  { series: 'B40', spec: '140*40*1.5', thickness: 1.5, perimeter: 238, weightPerMeter: 2.40, surfaceAreaPerMeter: 0.29 },

  // --- P型梁 (阶梯式) ---
  { series: 'P', spec: '50*30*1.0', thickness: 1.0, perimeter: 128, weightPerMeter: 1.19, surfaceAreaPerMeter: 0.18, inertiaI: 4.29 },
  { series: 'P', spec: '50*30*1.2', thickness: 1.2, perimeter: 128, weightPerMeter: 1.44, surfaceAreaPerMeter: 0.18, inertiaI: 5.07 },
  { series: 'P', spec: '50*30*1.5', thickness: 1.5, perimeter: 128, weightPerMeter: 1.79, surfaceAreaPerMeter: 0.18, inertiaI: 6.22 },
  { series: 'P', spec: '50*30*1.8', thickness: 1.8, perimeter: 128, weightPerMeter: 2.14, surfaceAreaPerMeter: 0.18, inertiaI: 7.37 },
  { series: 'P', spec: '50*30*2.0', thickness: 2.0, perimeter: 128, weightPerMeter: 2.36, surfaceAreaPerMeter: 0.18, inertiaI: 8.14 },
  { series: 'P', spec: '60*40*1.5', thickness: 1.5, perimeter: 158, weightPerMeter: 2.26, surfaceAreaPerMeter: 0.23, inertiaI: 12.58 },
  { series: 'P', spec: '60*40*2.0', thickness: 2.0, perimeter: 158, weightPerMeter: 2.99, surfaceAreaPerMeter: 0.23, inertiaI: 16.35 },

  // --- C型梁 (贯通式) ---
  { series: 'C', spec: '80*50*1.5', thickness: 1.5, perimeter: 188, weightPerMeter: 2.04, surfaceAreaPerMeter: 0.26, inertiaI: 60.1 },
  { series: 'C', spec: '100*50*2.0', thickness: 2.0, perimeter: 208, weightPerMeter: 2.72, surfaceAreaPerMeter: 0.28, inertiaI: 100.6 },
];

// ===== 斜撑 / 拉杆 =====

export const BRACING_PROFILES: BracingProfile[] = [
  // 斜撑角钢
  { name: '斜撑角铁', spec: '25*25*3.0', weightPerMeter: 1.124, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '25*25*4.0', weightPerMeter: 1.459, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '30*30*3.0', weightPerMeter: 1.373, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '30*30*4.0', weightPerMeter: 1.786, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '40*40*3.0', weightPerMeter: 1.852, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '40*40*4.0', weightPerMeter: 2.422, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '50*50*3.0', weightPerMeter: 2.332, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '50*50*4.0', weightPerMeter: 3.059, sectionType: 'angle' },
  { name: '斜撑角铁', spec: '50*50*5.0', weightPerMeter: 3.77, sectionType: 'angle' },
  // 斜撑方管
  { name: '斜撑方管', spec: '50*32*3.0', weightPerMeter: 1.908, sectionType: 'square_tube' },
  { name: '斜撑方管', spec: '56*36*3.0', weightPerMeter: 2.153, sectionType: 'square_tube' },
  { name: '斜撑方管', spec: '63*40*4.0', weightPerMeter: 3.185, sectionType: 'square_tube' },
  { name: '斜撑方管', spec: '75*50*5.0', weightPerMeter: 4.808, sectionType: 'square_tube' },
  { name: '斜撑方管', spec: '90*56*5.0', weightPerMeter: 5.661, sectionType: 'square_tube' },
  // 十字拉杆
  { name: '十字拉杆', spec: '30*17*1.2', weightPerMeter: 0.66, sectionType: 'flat_bar' },
  { name: '十字拉杆', spec: '40*24*1.2', weightPerMeter: 1.20, sectionType: 'flat_bar' },
  { name: '十字拉杆', spec: '40*29*1.2', weightPerMeter: 1.44, sectionType: 'flat_bar' },
  { name: '十字拉杆', spec: '40*34*1.2', weightPerMeter: 1.68, sectionType: 'flat_bar' },
  { name: '十字拉杆', spec: '40*39*1.5', weightPerMeter: 2.16, sectionType: 'flat_bar' },
];

// ===== 辅助查找函数 =====

/** 根据规格字符串查找立柱 */
export function findColumnProfile(spec: string): ColumnProfile | undefined {
  return COLUMN_PROFILES.find(p => p.spec === spec);
}

/** 根据规格字符串查找横梁 */
export function findBeamProfile(spec: string): BeamProfile | undefined {
  return BEAM_PROFILES.find(p => p.spec === spec);
}

/** 根据系列获取可用立柱规格列表 */
export function getColumnSpecsBySeries(series: string): string[] {
  return COLUMN_PROFILES.filter(p => p.series === series).map(p => p.spec);
}
