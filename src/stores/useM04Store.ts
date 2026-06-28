import { create } from 'zustand';
import type { ShelfType, ShelfConfig, BomCalcResult, Specification, SpecMatchResult } from '@/types/m04';
import * as m04Service from '@/services/m04';

interface M04State {
  shelfTypes: ShelfType[];
  configs: ShelfConfig[];
  specifications: Specification[];
  calcResult: BomCalcResult | null;
  specMatchResult: SpecMatchResult | null;
  currentShelfType: ShelfType | null;
  currentConfig: ShelfConfig | null;
  loading: boolean;
  error: string | null;
  fetchShelfTypes: () => Promise<void>;
  fetchConfigs: () => Promise<void>;
  fetchSpecifications: (shelfTypeId: string) => Promise<void>;
  fetchShelfTypeById: (id: string) => Promise<void>;
  fetchConfigById: (id: string) => Promise<void>;
  calculateBom: (configId: string) => Promise<void>;
  matchSpecification: (configId: string) => Promise<void>;
  createShelfType: (data: Partial<ShelfType>) => Promise<void>;
  createConfig: (data: Partial<ShelfConfig>) => Promise<void>;
  createSpecification: (data: Partial<Specification>) => Promise<void>;
  updateShelfType: (id: string, data: Partial<ShelfType>) => Promise<void>;
  updateConfig: (id: string, data: Partial<ShelfConfig>) => Promise<void>;
  updateSpecification: (id: string, data: Partial<Specification>) => Promise<void>;
  removeShelfType: (id: string) => Promise<void>;
  removeConfig: (id: string) => Promise<void>;
}

export const useM04Store = create<M04State>((set, _get) => ({
  shelfTypes: [],
  configs: [],
  specifications: [],
  calcResult: null,
  specMatchResult: null,
  currentShelfType: null,
  currentConfig: null,
  loading: false,
  error: null,

  fetchShelfTypes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m04Service.getShelfTypes();
      set({ shelfTypes: res.data.items || res.data as unknown as ShelfType[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m04Service.getConfigs();
      set({ configs: res.data.items || res.data as unknown as ShelfConfig[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchSpecifications: async (shelfTypeId) => {
    set({ error: null });
    try {
      const res = await m04Service.getSpecifications(shelfTypeId);
      set({ specifications: Array.isArray(res.data) ? res.data : (res.data as { items?: Specification[] }).items || [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchShelfTypeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m04Service.getShelfTypeById(id);
      set({ currentShelfType: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchConfigById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m04Service.getConfigById(id);
      set({ currentConfig: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  calculateBom: async (configId) => {
    set({ loading: true, error: null });
    try {
      const res = await m04Service.calculateBom(configId);
      set({ calcResult: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  matchSpecification: async (configId) => {
    set({ loading: true, error: null });
    try {
      const res = await m04Service.matchSpecification(configId);
      const result: SpecMatchResult = res.data as SpecMatchResult;
      set({ specMatchResult: result });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createShelfType: async (data) => {
    try {
      await m04Service.createShelfType(data);
      const res = await m04Service.getShelfTypes();
      set({ shelfTypes: res.data.items || res.data as unknown as ShelfType[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createConfig: async (data) => {
    // 后端 CreateShelfConfigDto 只接受 shelfTypeId + name + parameters，不含 shelfTypeName
    try {
      await m04Service.createConfig(data);
      const res = await m04Service.getConfigs();
      set({ configs: res.data.items || res.data as unknown as ShelfConfig[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createSpecification: async (data) => {
    try {
      await m04Service.createSpecification(data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateShelfType: async (id, data) => {
    try {
      await m04Service.updateShelfType(id, data);
      const res = await m04Service.getShelfTypes();
      set({ shelfTypes: res.data.items || res.data as unknown as ShelfType[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateConfig: async (id, data) => {
    try {
      await m04Service.updateConfig(id, data);
      const res = await m04Service.getConfigs();
      set({ configs: res.data.items || res.data as unknown as ShelfConfig[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateSpecification: async (id, data) => {
    try {
      await m04Service.updateSpecification(id, data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeShelfType: async (id) => {
    try {
      await m04Service.deleteShelfType(id);
      const res = await m04Service.getShelfTypes();
      set({ shelfTypes: res.data.items || res.data as unknown as ShelfType[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeConfig: async (id) => {
    try {
      await m04Service.deleteConfig(id);
      const res = await m04Service.getConfigs();
      set({ configs: res.data.items || res.data as unknown as ShelfConfig[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
