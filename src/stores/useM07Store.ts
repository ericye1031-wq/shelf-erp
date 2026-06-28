import { create } from 'zustand';
import type { Project, Milestone, Alert, GanttTask } from '@/types/m07';
import * as m07Service from '@/services/m07';

/** 统一提取列表数据（兼容分页格式和纯数组） */
function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M07State {
  projects: Project[];
  milestones: Milestone[];
  ganttTasks: GanttTask[];
  alerts: Alert[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  fetchMilestones: (projectId: string) => Promise<void>;
  fetchGanttTasks: (projectId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  createProject: (data: Record<string, unknown>) => Promise<void>;
  updateProject: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  createMilestone: (projectId: string, data: Record<string, unknown>) => Promise<void>;
  updateMilestone: (projectId: string, id: string, data: Record<string, unknown>) => Promise<void>;
  createGanttTask: (projectId: string, data: Record<string, unknown>) => Promise<void>;
  updateGanttTask: (projectId: string, id: string, data: Record<string, unknown>) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

export const useM07Store = create<M07State>((set, _get) => ({
  projects: [],
  milestones: [],
  ganttTasks: [],
  alerts: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m07Service.getProjects();
      set({ projects: extractItems(res) as Project[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m07Service.getProjectById(id);
      set({ currentProject: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchMilestones: async (projectId) => {
    set({ error: null });
    try {
      const res = await m07Service.getMilestones(projectId);
      set({ milestones: extractItems(res) as Milestone[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchGanttTasks: async (projectId) => {
    set({ error: null });
    try {
      const res = await m07Service.getGanttTasks(projectId);
      set({ ganttTasks: extractItems(res) as GanttTask[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchAlerts: async () => {
    set({ error: null });
    try {
      const res = await m07Service.getAlerts();
      set({ alerts: extractItems(res) as Alert[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createProject: async (data) => {
    set({ error: null });
    try {
      await m07Service.createProject(data);
      const res = await m07Service.getProjects();
      set({ projects: extractItems(res) as Project[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateProject: async (id, data) => {
    set({ error: null });
    try {
      await m07Service.updateProject(id, data);
      const res = await m07Service.getProjects();
      set({ projects: extractItems(res) as Project[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeProject: async (id) => {
    set({ error: null });
    try {
      await m07Service.deleteProject(id);
      const res = await m07Service.getProjects();
      set({ projects: extractItems(res) as Project[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createMilestone: async (projectId, data) => {
    set({ error: null });
    try {
      await m07Service.createMilestone(projectId, data);
      const res = await m07Service.getMilestones(projectId);
      set({ milestones: extractItems(res) as Milestone[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateMilestone: async (projectId, id, data) => {
    set({ error: null });
    try {
      await m07Service.updateMilestone(projectId, id, data);
      const res = await m07Service.getMilestones(projectId);
      set({ milestones: extractItems(res) as Milestone[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createGanttTask: async (projectId, data) => {
    set({ error: null });
    try {
      await m07Service.createGanttTask(projectId, data);
      const res = await m07Service.getGanttTasks(projectId);
      set({ ganttTasks: extractItems(res) as GanttTask[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateGanttTask: async (projectId, id, data) => {
    set({ error: null });
    try {
      await m07Service.updateGanttTask(projectId, id, data);
      const res = await m07Service.getGanttTasks(projectId);
      set({ ganttTasks: extractItems(res) as GanttTask[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  resolveAlert: async (id) => {
    set({ error: null });
    try {
      await m07Service.resolveAlert(id);
      const res = await m07Service.getAlerts();
      set({ alerts: extractItems(res) as Alert[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
