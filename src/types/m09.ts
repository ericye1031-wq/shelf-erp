/** 采购单状态 */
export type PurchaseStatus = 'draft' | 'submitted' | 'approved' | 'ordered' | 'partial_received' | 'received' | 'cancelled';

/** 供应商评级 */
export type SupplierRating = 'A' | 'B' | 'C' | 'D';

/** 供应商状态 */
export type SupplierStatus = 'active' | 'inactive' | 'blacklisted';

/** 采购单 */
export interface PurchaseOrder {
  id: string;
  code: string;
  projectId: string | null;
  supplierId: string | null;
  supplierName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  orderDate: string | null;
  expectedDate: string | null;
  amount: number;
  status: PurchaseStatus;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 采购明细 */
export interface PurchaseItem {
  id: string;
  purchaseOrderId: string;
  partCode: string | null;
  partName: string;
  material: string | null;
  spec: string | null;
  quantity: number;
  unit: string | null;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
  expectedDate: string | null;
  remark: string | null;
  sortOrder: number;
}

/** 供应商 */
export interface Supplier {
  id: string;
  code: string;
  name: string;
  supplyCategories: string;
  rating: SupplierRating;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  status: SupplierStatus;
  bankAccount: string | null;
  taxNumber: string | null;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/** 供应商报价 */
export interface SupplierQuote {
  id: string;
  supplierId: string;
  supplierName: string;
  requisitionId: string;
  materialCode: string;
  materialName: string;
  unitPrice: number;
  currency: string;
  leadTime: number;
  validFrom: string;
  validTo: string;
  status: string;
  remark: string | null;
  createdAt: string;
}

/** 供应商价格单 */
export interface SupplierPrice {
  id: string;
  supplierId: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  unitPrice: number;
  unit: string;
  currency: string;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  createdAt: string;
}
