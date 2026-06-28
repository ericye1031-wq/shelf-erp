/** BOM状态 */
export type BomStatus = 'draft' | 'released' | 'archived';

/** BOM类型 */
export type BomType = 'EBOM' | 'MBOM' | 'CBOM';

/** BOM */
export interface BOM {
  id: string;
  bomCode: string;
  name: string;
  bomType: BomType;
  projectId: string;
  shelfConfigId: string;
  version: number;
  status: BomStatus;
  items: BomItem[];
  totalWeight: number;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** BOM项 */
export interface BomItem {
  id: string;
  bomId: string;
  partCode: string;
  partName: string;
  material: string;
  spec: string;
  quantity: number;
  unit: string;
  length: number;
  weight: number;
  unitCost: number;
  totalCost: number;
  wasteRate: number;
  parentId: string | null;
  level: number;
  sort: number;
  alternativeIds: string[];
  remark: string;
}

/** BOM版本 */
export interface BomVersion {
  id: string;
  bomId: string;
  version: number;
  changeNote: string;
  changedItemIds: string[];
  createdAt: string;
  createdBy: string;
}

/** 替代料 */
export interface AlternativeMaterial {
  id: string;
  originalItemId: string;
  partCode: string;
  partName: string;
  material: string;
  spec: string;
  priority: number;
  priceDiff: number;
  available: boolean;
  remark: string;
}
