import { create } from 'zustand';
import type {
  ServiceTicket,
  Repair,
  Inspection,
  ReturnVisit,
  Warranty,
} from '@/types/m16';
import * as m16Service from '@/services/m16';

function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M16State {
  serviceTickets: ServiceTicket[];
  repairs: Repair[];
  inspections: Inspection[];
  returnVisits: ReturnVisit[];
  warranties: Warranty[];
  loading: boolean;
  error: string | null;

  // 服务工单
  fetchServiceTickets: (params?: Record<string, unknown>) => Promise<void>;
  createServiceTicket: (data: Record<string, unknown>) => Promise<void>;
  updateServiceTicket: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeServiceTicket: (id: string) => Promise<void>;

  // 维修管理
  fetchRepairs: (params?: Record<string, unknown>) => Promise<void>;
  createRepair: (data: Record<string, unknown>) => Promise<void>;
  updateRepair: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeRepair: (id: string) => Promise<void>;

  // 巡检管理
  fetchInspections: (params?: Record<string, unknown>) => Promise<void>;
  createInspection: (data: Record<string, unknown>) => Promise<void>;
  updateInspection: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeInspection: (id: string) => Promise<void>;

  // 客户回访
  fetchReturnVisits: (params?: Record<string, unknown>) => Promise<void>;
  createReturnVisit: (data: Record<string, unknown>) => Promise<void>;
  updateReturnVisit: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeReturnVisit: (id: string) => Promise<void>;

  // 质保管理
  fetchWarranties: (params?: Record<string, unknown>) => Promise<void>;
  createWarranty: (data: Record<string, unknown>) => Promise<void>;
  updateWarranty: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeWarranty: (id: string) => Promise<void>;
}

export const useM16Store = create<M16State>((set) => ({
  serviceTickets: [],
  repairs: [],
  inspections: [],
  returnVisits: [],
  warranties: [],
  loading: false,
  error: null,

  // 服务工单
  fetchServiceTickets: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m16Service.getServiceTickets(params);
      set({ serviceTickets: extractItems(res) as ServiceTicket[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createServiceTicket: async (data) => {
    set({ loading: true });
    try {
      await m16Service.createServiceTicket(data);
      const res = await m16Service.getServiceTickets();
      set({ serviceTickets: extractItems(res) as ServiceTicket[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateServiceTicket: async (id, data) => {
    set({ loading: true });
    try {
      await m16Service.updateServiceTicket(id, data);
      const res = await m16Service.getServiceTickets();
      set({ serviceTickets: extractItems(res) as ServiceTicket[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeServiceTicket: async (id) => {
    set({ loading: true });
    try {
      await m16Service.deleteServiceTicket(id);
      const res = await m16Service.getServiceTickets();
      set({ serviceTickets: extractItems(res) as ServiceTicket[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // 维修管理
  fetchRepairs: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m16Service.getRepairs(params);
      set({ repairs: extractItems(res) as Repair[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createRepair: async (data) => {
    set({ loading: true });
    try {
      await m16Service.createRepair(data);
      const res = await m16Service.getRepairs();
      set({ repairs: extractItems(res) as Repair[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateRepair: async (id, data) => {
    set({ loading: true });
    try {
      await m16Service.updateRepair(id, data);
      const res = await m16Service.getRepairs();
      set({ repairs: extractItems(res) as Repair[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeRepair: async (id) => {
    set({ loading: true });
    try {
      await m16Service.deleteRepair(id);
      const res = await m16Service.getRepairs();
      set({ repairs: extractItems(res) as Repair[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // 巡检管理
  fetchInspections: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m16Service.getInspections(params);
      set({ inspections: extractItems(res) as Inspection[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createInspection: async (data) => {
    set({ loading: true });
    try {
      await m16Service.createInspection(data);
      const res = await m16Service.getInspections();
      set({ inspections: extractItems(res) as Inspection[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateInspection: async (id, data) => {
    set({ loading: true });
    try {
      await m16Service.updateInspection(id, data);
      const res = await m16Service.getInspections();
      set({ inspections: extractItems(res) as Inspection[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeInspection: async (id) => {
    set({ loading: true });
    try {
      await m16Service.deleteInspection(id);
      const res = await m16Service.getInspections();
      set({ inspections: extractItems(res) as Inspection[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // 客户回访
  fetchReturnVisits: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m16Service.getReturnVisits(params);
      set({ returnVisits: extractItems(res) as ReturnVisit[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createReturnVisit: async (data) => {
    set({ loading: true });
    try {
      await m16Service.createReturnVisit(data);
      const res = await m16Service.getReturnVisits();
      set({ returnVisits: extractItems(res) as ReturnVisit[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateReturnVisit: async (id, data) => {
    set({ loading: true });
    try {
      await m16Service.updateReturnVisit(id, data);
      const res = await m16Service.getReturnVisits();
      set({ returnVisits: extractItems(res) as ReturnVisit[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeReturnVisit: async (id) => {
    set({ loading: true });
    try {
      await m16Service.deleteReturnVisit(id);
      const res = await m16Service.getReturnVisits();
      set({ returnVisits: extractItems(res) as ReturnVisit[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // 质保管理
  fetchWarranties: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m16Service.getWarranties(params);
      set({ warranties: extractItems(res) as Warranty[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createWarranty: async (data) => {
    set({ loading: true });
    try {
      await m16Service.createWarranty(data);
      const res = await m16Service.getWarranties();
      set({ warranties: extractItems(res) as Warranty[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateWarranty: async (id, data) => {
    set({ loading: true });
    try {
      await m16Service.updateWarranty(id, data);
      const res = await m16Service.getWarranties();
      set({ warranties: extractItems(res) as Warranty[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeWarranty: async (id) => {
    set({ loading: true });
    try {
      await m16Service.deleteWarranty(id);
      const res = await m16Service.getWarranties();
      set({ warranties: extractItems(res) as Warranty[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
