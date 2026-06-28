import { create } from 'zustand';
import type { Warehouse, WarehouseLocation, Batch, InventoryItem, PdaOperation } from '@/types/m11';
import * as m11Service from '@/services/m11';

interface M11State {
  warehouses: Warehouse[];
  locations: WarehouseLocation[];
  batches: Batch[];
  inventory: InventoryItem[];
  pdaOperations: PdaOperation[];
  currentWarehouse: Warehouse | null;
  loading: boolean;
  error: string | null;
  fetchWarehouses: () => Promise<void>;
  fetchWarehouseById: (id: string) => Promise<void>;
  fetchLocations: (warehouseId: string) => Promise<void>;
  fetchBatches: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchPdaOperations: () => Promise<void>;
  createWarehouse: (data: Partial<Warehouse>) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  removeWarehouse: (id: string) => Promise<void>;
  createLocation: (warehouseId: string, data: Partial<WarehouseLocation>) => Promise<void>;
  updateLocation: (warehouseId: string, id: string, data: Partial<WarehouseLocation>) => Promise<void>;
  createBatch: (data: Partial<Batch>) => Promise<void>;
  createPdaOperation: (data: Partial<PdaOperation>) => Promise<void>;
}

export const useM11Store = create<M11State>((set) => ({
  warehouses: [],
  locations: [],
  batches: [],
  inventory: [],
  pdaOperations: [],
  currentWarehouse: null,
  loading: false,
  error: null,

  fetchWarehouses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m11Service.getWarehouses();
      set({ warehouses: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchWarehouseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m11Service.getWarehouseById(id);
      set({ currentWarehouse: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchLocations: async (warehouseId) => {
    set({ error: null });
    try {
      const res = await m11Service.getLocations(warehouseId);
      set({ locations: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchBatches: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m11Service.getBatches();
      set({ batches: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchInventory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m11Service.getInventory();
      set({ inventory: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchPdaOperations: async () => {
    set({ error: null });
    try {
      const res = await m11Service.getPdaOperations();
      set({ pdaOperations: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createWarehouse: async (data) => {
    try {
      await m11Service.createWarehouse(data);
      const res = await m11Service.getWarehouses();
      set({ warehouses: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateWarehouse: async (id, data) => {
    try {
      await m11Service.updateWarehouse(id, data);
      const res = await m11Service.getWarehouses();
      set({ warehouses: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeWarehouse: async (id) => {
    try {
      await m11Service.deleteWarehouse(id);
      const res = await m11Service.getWarehouses();
      set({ warehouses: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createLocation: async (warehouseId, data) => {
    try {
      await m11Service.createLocation(warehouseId, data);
      const res = await m11Service.getLocations(warehouseId);
      set({ locations: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateLocation: async (warehouseId, id, data) => {
    try {
      await m11Service.updateLocation(warehouseId, id, data);
      const res = await m11Service.getLocations(warehouseId);
      set({ locations: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createBatch: async (data) => {
    try {
      await m11Service.createBatch(data);
      const res = await m11Service.getBatches();
      set({ batches: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createPdaOperation: async (data) => {
    try {
      await m11Service.createPdaOperation(data);
      const res = await m11Service.getPdaOperations();
      set({ pdaOperations: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
