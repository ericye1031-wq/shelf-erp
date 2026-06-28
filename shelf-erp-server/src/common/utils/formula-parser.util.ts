import { evaluate, compile } from 'mathjs';

/**
 * 公式解析器
 * 使用 mathjs 安全解析和计算数学表达式
 * 用于 BOM 计算引擎中的参数公式计算
 */

/** 安全的数学计算环境，禁止函数调用和赋值 */
const SAFE_SCOPE = {};

/**
 * 解析公式并计算结果
 * @param formula 数学公式，如 "layers + 1" 或 "length * width * 2"
 * @param parameters 参数变量表，如 { length: 2.7, width: 1.0, layers: 4 }
 * @returns 计算结果
 * @throws 如果公式不合法或引用了不存在的变量
 */
export function evaluateFormula(
  formula: string,
  parameters: Record<string, number>,
): number {
  try {
    const result = evaluate(formula, { ...SAFE_SCOPE, ...parameters });
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`公式 "${formula}" 计算结果不是有效数字: ${result}`);
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`公式解析失败: "${formula}" - ${message}`);
  }
}

/**
 * 预编译公式（适用于批量计算同一公式多次的场景）
 * @param formula 数学公式
 * @returns 编译后的公式对象，可多次调用 evaluate
 */
export function compileFormula(formula: string): {
  evaluate: (parameters: Record<string, number>) => number;
} {
  try {
    const compiled = compile(formula);
    return {
      evaluate(parameters: Record<string, number>): number {
        const result = compiled.evaluate({ ...SAFE_SCOPE, ...parameters });
        if (typeof result !== 'number' || !isFinite(result)) {
          throw new Error(
            `公式 "${formula}" 计算结果不是有效数字: ${result}`,
          );
        }
        return result;
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`公式编译失败: "${formula}" - ${message}`);
  }
}

/**
 * 校验公式语法是否合法
 * @param formula 数学公式
 * @returns 校验结果
 */
export function validateFormula(formula: string): {
  valid: boolean;
  error?: string;
} {
  try {
    compile(formula);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: message };
  }
}
