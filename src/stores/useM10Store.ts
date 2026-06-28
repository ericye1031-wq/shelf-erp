import { create } from 'zustand';
import type {
  WorkOrder, ProcessStep, ScheduleItem, ScanRecord,
  Equipment, QualityCheck, OeeData, ProcessRoute, MaterialDemand,
} from '@/types/m10';
import * as m10Service from '@/services/m10';

/** 统一提取列表数据（兼容分页格式和纯数组） */
function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d as unknown[];
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M10State {
  workOrders: WorkOrder[];
  processSteps: ProcessStep[];
  schedule: ScheduleItem[];
  scanRecords: ScanRecord[];
  equipment: Equipment[];
  qualityChecks: QualityCheck[];
  oeeData: OeeData[];
  processRoutes: ProcessRoute[];
  materialDemands: MaterialDemand[];
  currentWorkOrder: WorkOrder | null;
  currentEquipment: Equipment | null;
  loading: boolean;
  error: string | null;
  fetchWorkOrders: () => Promise<void>;
  fetchWorkOrderById: (id: string) => Promise<void>;
  fetchProcessSteps: (workOrderId: string) => Promise<void>;
  fetchSchedule: () => Promise<void>;
  fetchScanRecords: () => Promise<void>;
  fetchEquipment: () => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<void>;
  fetchQualityChecks: () => Promise<void>;
  fetchOee: () => Promise<void>;
  fetchProcessRoutes: (shelfTypeId: string) => Promise<void>;
  fetchMaterialDemands: (workOrderId: string) => Promise<void>;
  createWorkOrder: (data: Record<string, unknown>) => Promise<void>;
  updateWorkOrder: (id: string, data: Record<string, unknown>) => Promise<void>;
  releaseWorkOrder: (id: string) => Promise<void>;
  removeWorkOrder: (id: string) => Promise<void>;
  updateScheduleItem: (id: string, data: Record<string, unknown>) => Promise<void>;
  createScanRecord: (data: Record<string, unknown>) => Promise<void>;
  updateEquipment: (id: string, data: Record<string, unknown>) => Promise<void>;
  createQualityCheck: (data: Record<string, unknown>) => Promise<void>;
}

export const useM10Store = create<M10State>((set, _get) => ({
  workOrders: [],
  processSteps: [],
  schedule: [],
  scanRecords: [],
  equipment: [],
  qualityChecks: [],
  oeeData: [],
  processRoutes: [],
  materialDemands: [],
  currentWorkOrder: null,
  currentEquipment: null,
  loading: false,
  error: null,

  fetchWorkOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m10Service.getWorkOrders();
      set({ workOrders: extractItems(res) as WorkOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchWorkOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m10Service.getWorkOrderById(id);
      set({ currentWorkOrder: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchProcessSteps: async (workOrderId) => {
    set({ error: null });
    try {
      const res = await m10Service.getProcessSteps(workOrderId);
      set({ processSteps: extractItems(res) as ProcessStep[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchSchedule: async () => {
    set({ error: null });
    try {
      const res = await m10Service.getSchedule();
      set({ schedule: extractItems(res) as ScheduleItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchScanRecords: async () => {
    set({ error: null });
    try {
      const res = await m10Service.getScanRecords();
      set({ scanRecords: extractItems(res) as ScanRecord[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchEquipment: async () => {
    set({ error: null });
    try {
      const res = await m10Service.getEquipment();
      set({ equipment: extractItems(res) as Equipment[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchEquipmentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m10Service.getEquipmentById(id);
      set({ currentEquipment: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchQualityChecks: async () => {
    set({ error: null });
    try {
      const res = await m10Service.getQualityChecks();
      set({ qualityChecks: extractItems(res) as QualityCheck[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchOee: async () => {
    set({ error: null });
    try {
      const res = await m10Service.getOee();
      set({ oeeData: extractItems(res) as OeeData[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchProcessRoutes: async (shelfTypeId) => {
    set({ error: null });
    try {
      const res = await m10Service.getProcessRoutes(shelfTypeId);
      set({ processRoutes: extractItems(res) as ProcessRoute[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchMaterialDemands: async (workOrderId) => {
    set({ error: null });
    try {
      const res = await m10Service.getMaterialDemands(workOrderId);
      set({ materialDemands: extractItems(res) as MaterialDemand[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createWorkOrder: async (data) => {
    set({ error: null });
    try {
      await m10Service.createWorkOrder(data);
      const res = await m10Service.getWorkOrders();
      set({ workOrders: extractItems(res) as WorkOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateWorkOrder: async (id, data) => {
    set({ error: null });
    try {
      await m10Service.updateWorkOrder(id, data);
      const res = await m10Service.getWorkOrders();
      set({ workOrders: extractItems(res) as WorkOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  releaseWorkOrder: async (id) => {
    set({ error: null });
    try {
      await m10Service.releaseWorkOrder(id);
      const res = await m10Service.getWorkOrders();
      set({ workOrders: extractItems(res) as WorkOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeWorkOrder: async (id) => {
    set({ error: null });
    try {
      await m10Service.deleteWorkOrder(id);
      const res = await m10Service.getWorkOrders();
      set({ workOrders: extractItems(res) as WorkOrder[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateScheduleItem: async (id, data) => {
    set({ error: null });
    try {
      await m10Service.updateSchedule(id, data);
      const res = await m10Service.getSchedule();
      set({ schedule: extractItems(res) as ScheduleItem[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createScanRecord: async (data) => {
    set({ error: null });
    try {
      await m10Service.createScanRecord(data);
      const res = await m10Service.getScanRecords();
      set({ scanRecords: extractItems(res) as ScanRecord[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateEquipment: async (id, data) => {
    set({ error: null });
    try {
      await m10Service.updateEquipment(id, data);
      const res = await m10Service.getEquipment();
      set({ equipment: extractItems(res) as Equipment[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createQualityCheck: async (data) => {
    set({ error: null });
    try {
      await m10Service.createQualityCheck(data);
      const res = await m10Service.getQualityChecks();
      set({ qualityChecks: extractItems(res) as QualityCheck[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));