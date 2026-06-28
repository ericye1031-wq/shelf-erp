import { create } from 'zustand';
import type { BOM, BomVersion, AlternativeMaterial } from '@/types/m08';
import * as m08Service from '@/services/m08';

/** 统一提取列表数据（兼容分页格式和纯数组） */
function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M08State {
  boms: BOM[];
  versions: BomVersion[];
  alternatives: AlternativeMaterial[];
  currentBom: BOM | null;
  loading: boolean;
  error: string | null;
  fetchBoms: () => Promise<void>;
  fetchBomById: (id: string) => Promise<void>;
  fetchVersions: (bomId: string) => Promise<void>;
  fetchAlternatives: (bomItemId: string) => Promise<void>;
  createBom: (data: Record<string, unknown>) => Promise<void>;
  updateBom: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeBom: (id: string) => Promise<void>;
  createVersion: (bomId: string, data: Record<string, unknown>) => Promise<void>;
  createAlternative: (bomItemId: string, data: Record<string, unknown>) => Promise<void>;
  updateAlternative: (bomItemId: string, id: string, data: Record<string, unknown>) => Promise<void>;
  removeAlternative: (bomItemId: string, id: string) => Promise<void>;
  convertBom: (bomId: string, direction: string) => Promise<void>;
}

export const useM08Store = create<M08State>((set, _get) => ({
  boms: [],
  versions: [],
  alternatives: [],
  currentBom: null,
  loading: false,
  error: null,

  fetchBoms: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m08Service.getBoms();
      set({ boms: extractItems(res) as BOM[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchBomById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m08Service.getBomById(id);
      set({ currentBom: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchVersions: async (bomId) => {
    set({ error: null });
    try {
      const res = await m08Service.getBomVersions(bomId);
      set({ versions: extractItems(res) as BomVersion[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchAlternatives: async (bomItemId) => {
    set({ error: null });
    try {
      const res = await m08Service.getAlternatives(bomItemId);
      set({ alternatives: extractItems(res) as AlternativeMaterial[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createBom: async (data) => {
    set({ error: null });
    try {
      await m08Service.createBom(data);
      const res = await m08Service.getBoms();
      set({ boms: extractItems(res) as BOM[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateBom: async (id, data) => {
    set({ error: null });
    try {
      await m08Service.updateBom(id, data);
      const res = await m08Service.getBoms();
      set({ boms: extractItems(res) as BOM[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeBom: async (id) => {
    set({ error: null });
    try {
      await m08Service.deleteBom(id);
      const res = await m08Service.getBoms();
      set({ boms: extractItems(res) as BOM[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createVersion: async (bomId, data) => {
    set({ error: null });
    try {
      await m08Service.createBomVersion(bomId, data);
      const res = await m08Service.getBomVersions(bomId);
      set({ versions: extractItems(res) as BomVersion[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createAlternative: async (bomItemId, data) => {
    set({ error: null });
    try {
      await m08Service.createAlternative(bomItemId, data);
      const res = await m08Service.getAlternatives(bomItemId);
      set({ alternatives: extractItems(res) as AlternativeMaterial[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateAlternative: async (bomItemId, id, data) => {
    set({ error: null });
    try {
      await m08Service.updateAlternative(bomItemId, id, data);
      const res = await m08Service.getAlternatives(bomItemId);
      set({ alternatives: extractItems(res) as AlternativeMaterial[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeAlternative: async (bomItemId, id) => {
    set({ error: null });
    try {
      await m08Service.deleteAlternative(bomItemId, id);
      const res = await m08Service.getAlternatives(bomItemId);
      set({ alternatives: extractItems(res) as AlternativeMaterial[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  convertBom: async (bomId, direction) => {
    set({ error: null });
    try {
      await m08Service.convertBom(bomId, direction);
      const res = await m08Service.getBoms();
      set({ boms: extractItems(res) as BOM[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  },
}));
