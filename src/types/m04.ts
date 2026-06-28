import type { AuditFields, StatusType } from './common';

/** 货架类型 */
export interface ShelfType {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  parameterTemplate: ParameterDef[];
  status: StatusType;
  audit: AuditFields;
}

/** 参数定义 */
export interface ParameterDef {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'string';
  unit?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string | number;
  min?: number;
  max?: number;
}

/** 货架配置 */
export interface ShelfConfig {
  id: string;
  shelfTypeId: string;
  shelfTypeName: string;
  name: string;
  parameters: Record<string, string | number>;
  status: StatusType;
  audit: AuditFields;
  updatedAt?: string;
}

/** 规格定义 */
export interface Specification {
  id: string;
  shelfTypeId: string;
  name: string;
  parameterConstraints: Record<string, { min?: number; max?: number; values?: string[] }>;
  structureTemplate: StructureNode[];
  audit: AuditFields;
}

/** 结构节点 */
export interface StructureNode {
  partCode: string;
  partName: string;
  material?: string;
  quantityFormula: string;
  lengthFormula?: string;
  unit?: string;
  wasteRate?: number;
  children?: StructureNode[];
}

/** BOM计算结果 — 匹配后端 BomCalculationResultDto */
export interface BomCalcResult {
  configId: string;
  configName: string;
  specificationId: string;
  specificationName: string;
  parameters: Record<string, string | number>;
  items: BomCalcItem[];
  shelfTypeName?: string;  // 兼容旧代码
  totalWeight?: number;  // 兼容旧代码
  totalCost?: number;  // 兼容旧代码
  calculatedAt?: string;  // 兼容旧代码
  totalItems?: number;
  totalMaterialCost?: number;
}

/** BOM计算项 — 匹配后端 BomItemResultDto（树形结构） */
export interface BomCalcItem {
  partCode: string;
  partName: string;
  material: string;
  quantity: number;
  length: number;
  unit: string;
  unitWeight: number;
  weight?: number;  // 兼容旧代码
  unitCost: number;
  wasteRate: number;
  totalCost: number;
  category: string;
  spec?: string;  // 兼容旧代码
  isAccessory?: boolean;
  children?: BomCalcItem[];
}

/** 规格匹配结果 */
export interface SpecMatchResult {
  matched: boolean;
  specification: Specification | null;
  specId?: string;  // 兼容旧代码中的字段名
  specName?: string;  // 兼容旧代码中的字段名
  unmatchedParams: string[];
}
