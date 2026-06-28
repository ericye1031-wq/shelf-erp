import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Warehouse, WarehouseLocation, Batch, InventoryItem, PdaOperation } from '@/types/m11';

const BASE = '/m11';

export const getWarehouses = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Warehouse>>(`${BASE}/warehouses`, { params });

export const getWarehouseById = (id: string) =>
  api.get<Warehouse>(`${BASE}/warehouses/${id}`);

export const createWarehouse = (data: Partial<Warehouse>) =>
  api.post<Warehouse>(`${BASE}/warehouses`, data);

export const updateWarehouse = (id: string, data: Partial<Warehouse>) =>
  api.put<Warehouse>(`${BASE}/warehouses/${id}`, data);

export const deleteWarehouse = (id: string) =>
  api.delete(`${BASE}/warehouses/${id}`);

export const getLocations = (warehouseId: string) =>
  api.get<WarehouseLocation[]>(`${BASE}/warehouses/${warehouseId}/locations`);

export const createLocation = (warehouseId: string, data: Partial<WarehouseLocation>) =>
  api.post<WarehouseLocation>(`${BASE}/warehouses/${warehouseId}/locations`, data);

export const updateLocation = (warehouseId: string, id: string, data: Partial<WarehouseLocation>) =>
  api.put<WarehouseLocation>(`${BASE}/warehouses/${warehouseId}/locations/${id}`, data);

export const getBatches = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Batch>>(`${BASE}/batches`, { params });

export const getBatchById = (id: string) =>
  api.get<Batch>(`${BASE}/batches/${id}`);

export const createBatch = (data: Partial<Batch>) =>
  api.post<Batch>(`${BASE}/batches`, data);

export const getInventory = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<InventoryItem>>(`${BASE}/inventory`, { params });

export const getPdaOperations = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PdaOperation>>(`${BASE}/pda-operations`, { params });

export const createPdaOperation = (data: Partial<PdaOperation>) =>
  api.post<PdaOperation>(`${BASE}/pda-operations`, data);
