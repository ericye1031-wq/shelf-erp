/** 必填校验 */
export function required(value: unknown, label = '此项'): string | true {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return `${label}为必填项`;
  }
  return true;
}

/** 邮箱校验 */
export function isEmail(value: string): string | true {
  if (!value) return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? true : '请输入有效的邮箱地址';
}

/** 手机号校验 */
export function isPhone(value: string): string | true {
  if (!value) return true;
  const re = /^1[3-9]\d{9}$/;
  return re.test(value) ? true : '请输入有效的手机号';
}

/** 金额校验（非负数，最多2位小数） */
export function isAmount(value: string | number): string | true {
  if (value === '' || value === undefined || value === null) return true;
  const num = Number(value);
  if (isNaN(num)) return '请输入有效的金额';
  if (num < 0) return '金额不能为负数';
  const str = String(value);
  const decimalPart = str.split('.')[1];
  if (decimalPart && decimalPart.length > 2) return '金额最多保留2位小数';
  return true;
}
