import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { PurchaseOrder, PurchaseItem } from '@/types/m09';

const BASE = '/m08';

export const getPurchaseOrders = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PurchaseOrder>>(`${BASE}/purchases`, { params });

export const getPurchaseOrderById = (id: string) =>
  api.get<PurchaseOrder>(`${BASE}/purchases/${id}`);

export const createPurchaseOrder = (data: Record<string, unknown>) =>
  api.post<PurchaseOrder>(`${BASE}/purchases`, data);

export const updatePurchaseOrder = (id: string, data: Record<string, unknown>) =>
  api.put<PurchaseOrder>(`${BASE}/purchases/${id}`, data);

export const deletePurchaseOrder = (id: string) =>
  api.delete(`${BASE}/purchases/${id}`);

export const submitPurchaseOrder = (id: string) =>
  api.post<PurchaseOrder>(`${BASE}/purchases/${id}/submit`);

export const approvePurchaseOrder = (id: string) =>
  api.post<PurchaseOrder>(`${BASE}/purchases/${id}/approve`);

export const getPurchaseItems = (purchaseOrderId: string) =>
  api.get<PurchaseItem[]>(`${BASE}/purchases/${purchaseOrderId}/items`);

export const createPurchaseItem = (purchaseOrderId: string, data: Record<string, unknown>) =>
  api.post<PurchaseItem>(`${BASE}/purchases/${purchaseOrderId}/items`, data);

export const updatePurchaseItem = (purchaseOrderId: string, id: string, data: Record<string, unknown>) =>
  api.put<PurchaseItem>(`${BASE}/purchases/${purchaseOrderId}/items/${id}`, data);

export const deletePurchaseItem = (purchaseOrderId: string, id: string) =>
  api.delete(`${BASE}/purchases/${purchaseOrderId}/items/${id}`);

export const getSuppliers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<import('@/types/m09').Supplier>>(`${BASE}/suppliers`, { params });

export const createSupplier = (data: Record<string, unknown>) =>
  api.post<import('@/types/m09').Supplier>(`${BASE}/suppliers`, data);

export const updateSupplier = (id: string, data: Record<string, unknown>) =>
  api.put<import('@/types/m09').Supplier>(`${BASE}/suppliers/${id}`, data);

export const deleteSupplier = (id: string) =>
  api.delete(`${BASE}/suppliers/${id}`);

export const getSupplierPrices = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<import('@/types/m09').SupplierPrice>>(`${BASE}/supplier-prices`, { params });

export const getSupplierQuotes = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<import('@/types/m09').SupplierQuote>>(`${BASE}/supplier-quotes`, { params });

export const createSupplierQuote = (data: Record<string, unknown>) =>
  api.post<import('@/types/m09').SupplierQuote>(`${BASE}/supplier-quotes`, data);
