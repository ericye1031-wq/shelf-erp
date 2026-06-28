import { create } from 'zustand';
import type { CostDimension, CostVariance, CostAlert } from '@/types/m12';
import * as m12Service from '@/services/m12';

interface M12State {
  dimensions: CostDimension[];
  variances: CostVariance[];
  alerts: CostAlert[];
  loading: boolean;
  error: string | null;
  fetchDimensions: () => Promise<void>;
  fetchVariances: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchProjectCostSummary: (projectId: string) => Promise<void>;
  createDimension: (data: Partial<CostDimension>) => Promise<void>;
  updateDimension: (id: string, data: Partial<CostDimension>) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

export const useM12Store = create<M12State>((set) => ({
  dimensions: [],
  variances: [],
  alerts: [],
  loading: false,
  error: null,

  fetchDimensions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m12Service.getCostDimensions();
      set({ dimensions: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchVariances: async () => {
    set({ error: null });
    try {
      const res = await m12Service.getVariances();
      set({ variances: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchAlerts: async () => {
    set({ error: null });
    try {
      const res = await m12Service.getCostAlerts();
      set({ alerts: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchProjectCostSummary: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const res = await m12Service.getProjectCostSummary(projectId);
      set({ dimensions: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createDimension: async (data) => {
    try {
      await m12Service.createCostDimension(data);
      const res = await m12Service.getCostDimensions();
      set({ dimensions: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateDimension: async (id, data) => {
    try {
      await m12Service.updateCostDimension(id, data);
      const res = await m12Service.getCostDimensions();
      set({ dimensions: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  resolveAlert: async (id) => {
    try {
      await m12Service.resolveCostAlert(id);
      const res = await m12Service.getCostAlerts();
      set({ alerts: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
