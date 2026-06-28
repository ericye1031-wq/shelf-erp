/**
 * 货架配件数据库
 * ===================
 * 数据来源：
 *   - 标准货架材料.xls（螺栓、螺母、连接件）
 *   - 螺栓价格.xlsx
 *   - 货架参数表.xlsx（层板、托盘、地脚等）
 *
 * 包含：螺栓、螺母、连接件、层板扣件、地脚板等配件的重量和参考价格
 */

// ===== 类型定义 =====

export interface BoltSpec {
  type: BoltType;
  /** 规格如 'M6*45', '10*20' */
  spec: string;
  /** 单重 kg/个 */
  weight: number;
  /** 参考单价 元/个 */
  price: number;
}

export type BoltType =
  | 'hex_bolt'       // 六角螺栓
  | 'flange_bolt'    // 法兰螺栓
  | 'strong_flange'  // 加强法兰螺栓
  | 'hex_nut'        // 六角螺母
  | 'flange_nut'     // 法兰螺母
  | 'lock_washer';   // 防松垫圈

export interface ConnectorSpec {
  /** 名称如 'C型梁连接件', '斜撑角码' */
  name: string;
  /** 规格尺寸 */
  spec: string;
  /** 单重 kg/个 */
  weight: number;
  /** 参考单价 元/个 */
  price: number;
  /** 用途说明 */
  usage?: string;
}

// ===== 螺栓/螺母 数据库 =====

export const BOLT_SPECS: BoltSpec[] = [
  // ---- 六角螺栓 ----
  { type: 'hex_bolt', spec: 'M6*45', weight: 0.07, price: 0.12 },
  { type: 'hex_bolt', spec: 'M8*65', weight: 0.15, price: 0.18 },
  { type: 'hex_bolt', spec: 'M10*65', weight: 0.20, price: 0.22 },
  { type: 'hex_bolt', spec: 'M10*75', weight: 0.25, price: 0.25 },
  { type: 'hex_bolt', spec: 'M10*95', weight: 0.32, price: 0.30 },
  { type: 'hex_bolt', spec: 'M12*95', weight: 0.40, price: 0.35 },
  { type: 'hex_bolt', spec: 'M16*130', weight: 0.82, price: 0.65 },

  // ---- 法兰螺栓（冲孔立柱专用）----
  { type: 'flange_bolt', spec: '10*20', weight: 0.11, price: 0.15 },
  { type: 'flange_bolt', spec: '10*25', weight: 0.13, price: 0.17 },
  { type: 'flange_bolt', spec: '10*50', weight: 0.24, price: 0.28 },
  { type: 'flange_bolt', spec: '10*60', weight: 0.28, price: 0.32 },
  { type: 'flange_bolt', spec: '10*65', weight: 0.26, price: 0.30 },
  { type: 'flange_bolt', spec: '10*75', weight: 0.33, price: 0.33 },
  { type: 'flange_bolt', spec: '10*80', weight: 0.36, price: 0.36 },
  { type: 'flange_bolt', spec: '12*30', weight: 0.22, price: 0.25 },
  { type: 'flange_bolt', spec: '12*75', weight: 0.36, price: 0.40 },
  { type: 'flange_bolt', spec: '14*25', weight: 0.36, price: 0.42 },
  { type: 'flange_bolt', spec: '6*45', weight: 0.07, price: 0.11 },

  // ---- 加强法兰螺栓（托盘面板专用）----
  { type: 'strong_flange', spec: '10*25', weight: 0.19, price: 0.30 },
  { type: 'strong_flange', spec: '10*65', weight: 0.38, price: 0.50 },
  { type: 'strong_flange', spec: '16*45', weight: 0.77, price: 0.85 },
  { type: 'strong_flange', spec: '20*60', weight: 1.60, price: 1.80 },
  { type: 'strong_flange', spec: '20*140', weight: 4.50, price: 5.00 },
  { type: 'strong_flange', spec: '20*160', weight: 5.20, price: 5.80 },

  // ---- 六角螺母 ----
  { type: 'hex_nut', spec: 'M4', weight: 0.02, price: 0.03 },
  { type: 'hex_nut', spec: 'M5', weight: 0.03, price: 0.04 },
  { type: 'hex_nut', spec: 'M6', weight: 0.04, price: 0.06 },
  { type: 'hex_nut', spec: 'M8', weight: 0.033, price: 0.05 },
  { type: 'hex_nut', spec: 'M10', weight: 0.05, price: 0.08 },
  { type: 'hex_nut', spec: 'M12', weight: 0.10, price: 0.15 },
  { type: 'hex_nut', spec: 'M16', weight: 0.22, price: 0.30 },

  // ---- 法兰螺母（C型梁专用）----
  { type: 'flange_nut', spec: 'M7', weight: 0.017, price: 0.03 },
  { type: 'flange_nut', spec: 'M8', weight: 0.032, price: 0.05 },
  { type: 'flange_nut', spec: 'M10', weight: 0.065, price: 0.10 },

  // ---- 防松垫圈 ----
  { type: 'lock_washer', spec: '4.8*25', weight: 0.04, price: 0.05 },
  { type: 'lock_washer', spec: '4.8*60', weight: 0.09, price: 0.10 },
  { type: 'lock_washer', spec: 'H17', weight: 0.26, price: 0.18 },
  { type: 'lock_washer', spec: 'O-O(M16)', weight: 6.00, price: 3.50 },
];

// ===== 连接件 数据库 =====

export const CONNECTOR_SPECS: ConnectorSpec[] = [
  // ---- 斜撑类连接件 ----
  { name: '斜撑角码', spec: '25*25*3.0', weight: 1.124, price: 3.50, usage: '轻型斜撑固定' },
  { name: '斜撑角码', spec: '30*30*3.0', weight: 1.373, price: 4.20, usage: '标准斜撑固定' },
  { name: '斜撑角码', spec: '40*40*3.0', weight: 1.852, price: 5.80, usage: '重型斜撑固定' },
  { name: '斜撑角铁', spec: '50*32*3.0', weight: 1.908, price: 6.00, usage: '标准斜撑方管' },
  { name: '斜撑方管', spec: '56*36*3.0', weight: 2.153, price: 6.80, usage: '加强斜撑' },
  { name: '斜撑方管', spec: '63*40*4.0', weight: 3.185, price: 9.50, usage: '重型斜撑' },
  { name: '斜撑方管', spec: '75*50*5.0', weight: 4.808, price: 13.00, usage: '超重斜撑' },

  // ---- C/P型梁连接件 ----
  { name: 'C型梁', spec: '80*50*1.5', weight: 2.04, price: 12.00, usage: '贯通式层板梁' },
  { name: 'C型梁', spec: '100*50*2.0', weight: 2.72, price: 15.00, usage: '贯通式层板梁(重)' },
  { name: 'P型梁', spec: '50*30*1.5', weight: 1.79, price: 11.00, usage: '阶梯式层板梁' },
  { name: 'P型梁', spec: '60*40*1.5', weight: 2.26, price: 13.00, usage: '阶梯式层板梁(宽)' },
  { name: 'P型梁', spec: '60*40*2.0', weight: 2.99, price: 16.00, usage: '阶梯式层板梁(厚)' },

  // ---- 层板/托盘类 ----
  { name: '层板扣件(一字)', spec: '30*17*1.2', weight: 0.66, price: 2.50, usage: '层板与横梁连接' },
  { name: '层板扣件(三爪)', spec: '30*17*1.5', weight: 0.82, price: 3.20, usage: '加强型层板连接' },
  { name: '托盘封边', spec: '20*28*20*1.0~1.2', weight: 1.20, price: 5.00, usage: '钢制托盘封边条' },
  { name: '平护脚', spec: '200*65*2.0~3.0', weight: 6.50, price: 18.00, usage: '托盘底部防护' },
  { name: 'U型槽钢', spec: '19*38*1.5', weight: 1.15, price: 8.00, usage: '托盘框架槽钢' },

  // ---- 地脚/底座类 ----
  { name: '地脚板', spec: '140*100*6', weight: 6.50, price: 8.00, usage: '立柱地脚固定' },
  { name: '地脚板', spec: '150*150*8', weight: 14.00, price: 15.00, usage: '重载立柱地脚' },
  { name: '可调地脚', spec: 'M16*150', weight: 0.85, price: 5.50, usage: '高度可调地脚' },
  { name: '塑料调整脚', spec: 'M12*100', weight: 0.25, price: 2.00, usage: '微调高度' },
  { name: '安全销', spec: 'φ3.5', weight: 0.03, price: 0.15, usage: '立柱安全插销' },

  // ---- 其他配件 ----
  { name: '背网/背板', spec: '网格1.5寸', weight: 3.50, price: 25.00, usage: '每平米价格' },
  { name: '防护网片', spec: '50*100', weight: 0.50, price: 3.50, usage: '通道防护' },
  { name: '标识牌', spec: 'A4', weight: 0.05, price: 2.00, usage: '货位标识' },
  { name: '防撞护栏', spec: 'Φ48钢管', weight: 4.50, price: 35.00, usage: '通道防撞(元/米)' },
];

// ===== H型/C型通廊货架专用 =====

export const AISLE_RACK_PARTS: ConnectorSpec[] = [
  { name: 'H通廊立柱', spec: '100*95*2.0~2.5', weight: 5.20, price: 28.00, usage: '通廊货架主柱' },
  { name: 'H通廊顶梁', spec: '160*50*2.0', weight: 3.88, price: 22.00, usage: '顶部连接' },
  { name: 'H通廊底梁', spec: '100*50*1.8', weight: 2.46, price: 15.00, usage: '底部支撑' },
  { name: 'C型通廊梁', spec: '120*50*2.0', weight: 2.98, price: 18.00, usage: '贯通梁' },
  { name: 'Z型钢', spec: '156*40*2~3.15', weight: 5.80, price: 32.00, usage: '屋面檩条' },
];

// ===== 辅助函数 =====

/** 根据类型和规格查找螺栓 */
export function findBolt(type: BoltType, spec: string): BoltSpec | undefined {
  return BOLT_SPECS.find(b => b.type === type && b.spec === spec);
}

/** 获取某类型的所有螺栓规格 */
export function getBoltsByType(type: BoltType): BoltSpec[] {
  return BOLT_SPECS.filter(b => b.type === type);
}

/** 计算一组螺栓的总价和重量 */
export function calcBoltCost(items: Array<{ type: BoltType; spec: string; qty: number }>): { totalWeight: number; totalPrice: number } {
  let totalWeight = 0;
  let totalPrice = 0;
  for (const item of items) {
    const bolt = findBolt(item.type, item.spec);
    if (bolt) {
      totalWeight += bolt.weight * item.qty;
      totalPrice += bolt.price * item.qty;
    }
  }
  return { totalWeight, totalPrice };
}
