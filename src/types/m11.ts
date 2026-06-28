import type { AuditFields, StatusType } from './common';

/** 仓库 */
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: '原料仓' | '半成品仓' | '成品仓' | '辅料仓' | '退货仓';
  address: string;
  managerId: string;
  managerName: string;
  status: StatusType;
  audit: AuditFields;
}

/** 库位 */
export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  zone: string;
  row: string;
  column: string;
  layer: string;
  type: 'storage' | 'picking' | 'staging' | 'buffer';
  status: StatusType;
}

/** 批次 */
export interface Batch {
  id: string;
  code: string;
  material: string;
  spec: string;
  supplier: string;
  quantity: number;
  remainingQty: number;
  unit: string;
  productionDate: string;
  expiryDate: string | null;
  status: 'in_inspection' | 'qualified' | 'unqualified' | 'frozen';
  locationId: string;
  locationCode: string;
  audit: AuditFields;
}

/** 库存项 */
export interface InventoryItem {
  id: string;
  material: string;
  spec: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationCode: string;
  batchId: string;
  batchCode: string;
  quantity: number;
  unit: string;
  safetyStock: number;
  status: 'normal' | 'low' | 'overstock' | 'frozen';
  lastUpdated: string;
}

/** PDA操作记录 */
export interface PdaOperation {
  id: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'check' | 'freeze' | 'unfreeze';
  operatorId: string;
  operatorName: string;
  warehouseId: string;
  locationId: string;
  batchId: string;
  material: string;
  spec: string;
  quantity: number;
  unit: string;
  referenceNo: string;
  operatedAt: string;
  remark: string;
}
