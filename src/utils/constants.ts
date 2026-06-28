/** 14道工序枚举 */
export const PROCESS_STEPS = [
  '开卷', '冲孔', '冷弯成型', '定尺切割', '焊接',
  '校正', '表面处理', '喷涂', '固化', '包装',
  '横梁冲压', '横梁焊接', '附件加工', '组装',
] as const;

export type ProcessStep = (typeof PROCESS_STEPS)[number];

/** 5种仓库类型 */
export const WAREHOUSE_TYPES = ['原料仓', '半成品仓', '成品仓', '辅料仓', '退货仓'] as const;
export type WarehouseType = (typeof WAREHOUSE_TYPES)[number];

/** 货架类型 */
export const SHELF_TYPES = [
  '横梁式货架', '贯通式货架', '重力式货架', '悬臂式货架',
  '阁楼式货架', '流利式货架', '抽屉式货架', '窄巷道货架',
] as const;
export type ShelfType = (typeof SHELF_TYPES)[number];

/** 业务状态 */
export const BIZ_STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  active: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20;
