import { create } from 'zustand';
import type { Scheme, SchemeVersion, Drawing } from '@/types/m03';
import * as m03Service from '@/services/m03';

/** 统一提取列表数据（兼容分页格式和纯数组） */
function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M03State {
  schemes: Scheme[];
  versions: SchemeVersion[];
  drawings: Drawing[];
  currentScheme: Scheme | null;
  loading: boolean;
  error: string | null;
  fetchSchemes: () => Promise<void>;
  fetchSchemeById: (id: string) => Promise<void>;
  fetchVersions: (schemeId: string) => Promise<void>;
  createScheme: (data: Record<string, unknown>) => Promise<void>;
  updateScheme: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeScheme: (id: string) => Promise<void>;
  changeSchemeStatus: (id: string, status: string) => Promise<void>;
  createVersion: (schemeId: string, data: Record<string, unknown>) => Promise<void>;
  approveVersion: (versionId: string, approvedBy: string) => Promise<void>;
  fetchDrawings: (params?: Record<string, unknown>) => Promise<void>;
  fetchDrawingsByCategory: (category: string) => Promise<void>;
  createDrawing: (data: Record<string, unknown>) => Promise<void>;
  updateDrawing: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeDrawing: (id: string) => Promise<void>;
  changeDrawingStatus: (id: string, status: string) => Promise<void>;
}

export const useM03Store = create<M03State>((set, _get) => ({
  schemes: [],
  versions: [],
  drawings: [],
  currentScheme: null,
  loading: false,
  error: null,

  fetchSchemes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m03Service.getSchemes();
      set({ schemes: extractItems(res) as Scheme[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchSchemeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m03Service.getSchemeById(id);
      set({ currentScheme: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchVersions: async (schemeId) => {
    set({ error: null });
    try {
      const res = await m03Service.getSchemeVersions(schemeId);
      set({ versions: extractItems(res) as SchemeVersion[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createScheme: async (data) => {
    set({ error: null });
    try {
      await m03Service.createScheme(data);
      const res = await m03Service.getSchemes();
      set({ schemes: extractItems(res) as Scheme[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateScheme: async (id, data) => {
    set({ error: null });
    try {
      await m03Service.updateScheme(id, data);
      const res = await m03Service.getSchemes();
      set({ schemes: extractItems(res) as Scheme[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeScheme: async (id) => {
    set({ error: null });
    try {
      await m03Service.deleteScheme(id);
      const res = await m03Service.getSchemes();
      set({ schemes: extractItems(res) as Scheme[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  changeSchemeStatus: async (id, status) => {
    set({ error: null });
    try {
      await m03Service.changeSchemeStatus(id, status);
      const res = await m03Service.getSchemes();
      set({ schemes: extractItems(res) as Scheme[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createVersion: async (schemeId, data) => {
    set({ error: null });
    try {
      await m03Service.createSchemeVersion(schemeId, data);
      const res = await m03Service.getSchemeVersions(schemeId);
      set({ versions: extractItems(res) as SchemeVersion[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  approveVersion: async (versionId, approvedBy) => {
    set({ error: null });
    try {
      await m03Service.approveSchemeVersion(versionId, approvedBy);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchDrawings: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m03Service.getDrawings(params);
      set({ drawings: extractItems(res) as Drawing[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchDrawingsByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const res = await m03Service.getDrawingsByCategory(category);
      set({ drawings: extractItems(res) as Drawing[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createDrawing: async (data) => {
    set({ error: null });
    try {
      await m03Service.createDrawing(data);
      const res = await m03Service.getDrawings();
      set({ drawings: extractItems(res) as Drawing[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateDrawing: async (id, data) => {
    set({ error: null });
    try {
      await m03Service.updateDrawing(id, data);
      const res = await m03Service.getDrawings();
      set({ drawings: extractItems(res) as Drawing[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeDrawing: async (id) => {
    set({ error: null });
    try {
      await m03Service.deleteDrawing(id);
      const res = await m03Service.getDrawings();
      set({ drawings: extractItems(res) as Drawing[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  changeDrawingStatus: async (id, status) => {
    set({ error: null });
    try {
      await m03Service.changeDrawingStatus(id, status);
      const res = await m03Service.getDrawings();
      set({ drawings: extractItems(res) as Drawing[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
