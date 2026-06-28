import dayjs from 'dayjs';

export function formatDate(value: string | Date, template = 'YYYY-MM-DD'): string {
  return dayjs(value).format(template);
}

export function formatMoney(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}
