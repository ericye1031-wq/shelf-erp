import { create } from 'zustand';

interface Equipment { id: string; name: string; }
interface WorkOrder { id: string; name: string; }
interface ScheduleResult { id: string; makespan: number; equipmentUtilization: number; changeoverTime: number; schedule?: any[]; createdAt: string; }
interface M19State {
  equipment: Equipment[]; workOrders: WorkOrder[];
  history: ScheduleResult[]; currentResult: ScheduleResult | null;
  optimizing: boolean; loading: boolean; error: string | null;
  fetchEquipment: () => Promise<void>;
  fetchWorkOrders: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  runOptimization: (batchId: string) => Promise<void>;
}

export const useM19Store = create<M19State>((set, get) => ({
  equipment: [], workOrders: [], history: [], currentResult: null,
  optimizing: false, loading: false, error: null,

  fetchEquipment: async () => {
    try {
      const res = await fetch('/api/m10/equipment');
      const json = await res.json();
      set({ equipment: (json.data || []).slice(0, 3).map((e: any) => ({ id: e.id, name: e.name })) });
    } catch {}
  },

  fetchWorkOrders: async () => {
    try {
      const res = await fetch('/api/m10/work-orders');
      const json = await res.json();
      set({ workOrders: (json.data || []).slice(0, 6).map((w: any) => ({ id: w.id, name: w.workOrderCode || w.name || w.id })) });
    } catch {}
  },

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/m19/ai-schedule');
      const json = await res.json();
      set({ history: json.data || [], loading: false });
    } catch { set({ loading: false }); }
  },

  runOptimization: async (batchId: string) => {
    set({ optimizing: true, error: null });
    try {
      const res = await fetch('/api/m19/ai-schedule/optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const json = await res.json();
      if (json.data) {
        set((s) => ({ currentResult: json.data, history: [json.data, ...s.history], optimizing: false }));
      } else { set({ optimizing: false, error: json.message }); }
    } catch (e: any) { set({ optimizing: false, error: e.message }); }
  },
}));
