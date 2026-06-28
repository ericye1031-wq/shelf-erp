import dayjs from 'dayjs';

/**
 * 单号生成器
 * 生成格式: 前缀 + 年月 + 序号，如 INQ202501001
 */

/** 模块前缀映射 */
const MODULE_PREFIX: Record<string, string> = {
  inquiry: 'INQ',
  quotation: 'QT',
  contract: 'CT',
  project: 'PRJ',
  workOrder: 'WO',
  batch: 'BAT',
  invoice: 'INV',
  requisition: 'PRQ',
  inspection: 'INS',
  scheme: 'FA',
  drawing: 'DWG',
  voucher: 'VOU',
  receipt: 'REC',
  payment: 'PAY',
  install: 'IN',
  employee: 'EMP',
  attendance: 'ATT',
  salary: 'SAL',
  training: 'TRN',
  performance: 'PERF',
  serviceTicket: 'SVC',
  repair: 'REP',
  m16Inspection: 'INSP',
  returnVisit: 'RV',
  warranty: 'WAR',
  dashboard: 'DASH',
  report: 'RPT',
  kpi: 'KPI',
  dataSource: 'DS',
};

/**
 * 生成业务单号
 * @param module 模块名称，如 'inquiry', 'quotation'
 * @param sequence 序号，当日第几个
 * @param date 日期，默认当天
 * @returns 格式化单号，如 INQ202501001
 */
export function generateCode(
  module: string,
  sequence: number,
  date: Date = new Date(),
): string {
  const prefix = MODULE_PREFIX[module] ?? module.toUpperCase().slice(0, 3);
  const dateStr = dayjs(date).format('YYYYMM');
  const seq = String(sequence).padStart(3, '0');
  return `${prefix}${dateStr}${seq}`;
}

/**
 * 从单号中解析日期和序号
 * @param code 单号，如 INQ202501001
 * @returns 解析结果
 */
export function parseCode(
  code: string,
): { prefix: string; year: number; month: number; sequence: number } | null {
  const match = code.match(/^([A-Z]+)(\d{4})(\d{2})(\d{3})$/);
  if (!match) {
    return null;
  }
  return {
    prefix: match[1],
    year: parseInt(match[2], 10),
    month: parseInt(match[3], 10),
    sequence: parseInt(match[4], 10),
  };
}
