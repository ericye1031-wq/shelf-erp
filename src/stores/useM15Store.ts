import { create } from 'zustand';
import type {
  InstallPlan, InstallTeam, InstallReport, InstallCost,
  InstallIssue, InstallAcceptance,
} from '@/types/m15';
import * as m15Service from '@/services/m15';

function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d as unknown[];
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M15State {
  plans: InstallPlan[];
  currentPlan: InstallPlan | null;
  teams: InstallTeam[];
  reports: InstallReport[];
  costs: InstallCost[];
  issues: InstallIssue[];
  acceptances: InstallAcceptance[];
  currentIssue: InstallIssue | null;
  loading: boolean;
  error: string | null;

  // 计划
  fetchPlans: (params?: Record<string, unknown>) => Promise<void>;
  fetchPlanById: (id: string) => Promise<void>;
  createPlan: (data: Record<string, unknown>) => Promise<void>;
  updatePlan: (id: string, data: Record<string, unknown>) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
  changeStatus: (id: string, status: string) => Promise<void>;

  // 人员
  fetchTeams: (planId: string) => Promise<void>;
  createTeam: (data: Record<string, unknown>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;

  // 报工
  fetchReports: (params?: Record<string, unknown>) => Promise<void>;
  createReport: (data: Record<string, unknown>) => Promise<void>;
  removeReport: (id: string) => Promise<void>;

  // 成本
  fetchCosts: (planId: string) => Promise<void>;
  createCost: (data: Record<string, unknown>) => Promise<void>;
  updateCost: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeCost: (id: string) => Promise<void>;

  // 问题
  fetchIssues: (params?: Record<string, unknown>) => Promise<void>;
  fetchIssueById: (id: string) => Promise<void>;
  createIssue: (data: Record<string, unknown>) => Promise<void>;
  updateIssue: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeIssue: (id: string) => Promise<void>;

  // 验收
  fetchAcceptances: (planId: string) => Promise<void>;
  createAcceptance: (data: Record<string, unknown>) => Promise<void>;
  removeAcceptance: (id: string) => Promise<void>;
}

export const useM15Store = create<M15State>((set) => ({
  plans: [],
  currentPlan: null,
  teams: [],
  reports: [],
  costs: [],
  issues: [],
  acceptances: [],
  currentIssue: null,
  loading: false,
  error: null,

  // ─── 计划 ───
  fetchPlans: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m15Service.getPlans(params);
      set({ plans: extractItems(res) as InstallPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally { set({ loading: false }); }
  },

  fetchPlanById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m15Service.getPlanById(id);
      set({ currentPlan: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally { set({ loading: false }); }
  },

  createPlan: async (data) => {
    set({ error: null });
    try {
      await m15Service.createPlan(data);
      const res = await m15Service.getPlans();
      set({ plans: extractItems(res) as InstallPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updatePlan: async (id, data) => {
    set({ error: null });
    try {
      await m15Service.updatePlan(id, data);
      const res = await m15Service.getPlans();
      set({ plans: extractItems(res) as InstallPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removePlan: async (id) => {
    set({ error: null });
    try {
      await m15Service.deletePlan(id);
      const res = await m15Service.getPlans();
      set({ plans: extractItems(res) as InstallPlan[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  changeStatus: async (id, status) => {
    set({ error: null });
    try {
      await m15Service.changePlanStatus(id, status);
      const res = await m15Service.getPlans();
      set({ plans: extractItems(res) as InstallPlan[] });
      if (status) {
        const planRes = await m15Service.getPlanById(id);
        set({ currentPlan: planRes.data });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ─── 人员 ───
  fetchTeams: async (planId) => {
    set({ error: null });
    try {
      const res = await m15Service.getTeams(planId);
      set({ teams: Array.isArray(res.data) ? res.data : [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createTeam: async (data) => {
    set({ error: null });
    try {
      await m15Service.createTeam(data);
      if (data.planId) {
        const res = await m15Service.getTeams(data.planId as string);
        set({ teams: Array.isArray(res.data) ? res.data : [] });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeTeam: async (id) => {
    set({ error: null });
    try {
      await m15Service.deleteTeam(id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ─── 报工 ───
  fetchReports: async (params) => {
    set({ error: null });
    try {
      const res = await m15Service.getReports(params);
      set({ reports: extractItems(res) as InstallReport[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createReport: async (data) => {
    set({ error: null });
    try {
      await m15Service.createReport(data);
      const res = await m15Service.getReports();
      set({ reports: extractItems(res) as InstallReport[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeReport: async (id) => {
    set({ error: null });
    try {
      await m15Service.deleteReport(id);
      const res = await m15Service.getReports();
      set({ reports: extractItems(res) as InstallReport[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ─── 成本 ───
  fetchCosts: async (planId) => {
    set({ error: null });
    try {
      const res = await m15Service.getCosts(planId);
      set({ costs: Array.isArray(res.data) ? res.data : [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createCost: async (data) => {
    set({ error: null });
    try {
      await m15Service.createCost(data);
      if (data.planId) {
        const res = await m15Service.getCosts(data.planId as string);
        set({ costs: Array.isArray(res.data) ? res.data : [] });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateCost: async (id, data) => {
    set({ error: null });
    try {
      await m15Service.updateCost(id, data);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeCost: async (id) => {
    set({ error: null });
    try {
      await m15Service.deleteCost(id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ─── 问题 ───
  fetchIssues: async (params) => {
    set({ error: null });
    try {
      const res = await m15Service.getIssues(params);
      set({ issues: extractItems(res) as InstallIssue[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchIssueById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m15Service.getIssueById(id);
      set({ currentIssue: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally { set({ loading: false }); }
  },

  createIssue: async (data) => {
    set({ error: null });
    try {
      await m15Service.createIssue(data);
      const res = await m15Service.getIssues();
      set({ issues: extractItems(res) as InstallIssue[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateIssue: async (id, data) => {
    set({ error: null });
    try {
      await m15Service.updateIssue(id, data);
      const res = await m15Service.getIssues();
      set({ issues: extractItems(res) as InstallIssue[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeIssue: async (id) => {
    set({ error: null });
    try {
      await m15Service.deleteIssue(id);
      const res = await m15Service.getIssues();
      set({ issues: extractItems(res) as InstallIssue[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  // ─── 验收 ───
  fetchAcceptances: async (planId) => {
    set({ error: null });
    try {
      const res = await m15Service.getAcceptances(planId);
      set({ acceptances: Array.isArray(res.data) ? res.data : [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createAcceptance: async (data) => {
    set({ error: null });
    try {
      await m15Service.createAcceptance(data);
      if (data.planId) {
        const res = await m15Service.getAcceptances(data.planId as string);
        set({ acceptances: Array.isArray(res.data) ? res.data : [] });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeAcceptance: async (id) => {
    set({ error: null });
    try {
      await m15Service.deleteAcceptance(id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
