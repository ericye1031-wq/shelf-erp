import { create } from 'zustand';
import type {
  Employee,
  AttendanceRecord,
  SalaryRecord,
  TrainingRecord,
  PerformanceReview,
} from '@/types/m14';
import * as m14Service from '@/services/m14';

function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) {
    return (d as { items: unknown[] }).items;
  }
  return [];
}

interface M14State {
  employees: Employee[];
  attendance: AttendanceRecord[];
  salary: SalaryRecord[];
  training: TrainingRecord[];
  performance: PerformanceReview[];
  loading: boolean;
  error: string | null;

  // 员工
  fetchEmployees: (params?: Record<string, unknown>) => Promise<void>;
  createEmployee: (data: Record<string, unknown>) => Promise<void>;
  updateEmployee: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  changeEmployeeStatus: (id: string, status: string) => Promise<void>;

  // 考勤
  fetchAttendance: (params?: Record<string, unknown>) => Promise<void>;
  createAttendance: (data: Record<string, unknown>) => Promise<void>;
  updateAttendance: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeAttendance: (id: string) => Promise<void>;

  // 薪资
  fetchSalary: (params?: Record<string, unknown>) => Promise<void>;
  createSalary: (data: Record<string, unknown>) => Promise<void>;
  updateSalary: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeSalary: (id: string) => Promise<void>;
  changeSalaryStatus: (id: string, status: string) => Promise<void>;

  // 培训
  fetchTraining: (params?: Record<string, unknown>) => Promise<void>;
  createTraining: (data: Record<string, unknown>) => Promise<void>;
  updateTraining: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeTraining: (id: string) => Promise<void>;
  changeTrainingStatus: (id: string, status: string) => Promise<void>;

  // 绩效
  fetchPerformance: (params?: Record<string, unknown>) => Promise<void>;
  createPerformance: (data: Record<string, unknown>) => Promise<void>;
  updatePerformance: (id: string, data: Record<string, unknown>) => Promise<void>;
  removePerformance: (id: string) => Promise<void>;
  changePerformanceStatus: (id: string, status: string) => Promise<void>;
}

export const useM14Store = create<M14State>((set) => ({
  employees: [],
  attendance: [],
  salary: [],
  training: [],
  performance: [],
  loading: false,
  error: null,

  // 员工
  fetchEmployees: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m14Service.getEmployees(params);
      set({ employees: extractItems(res) as Employee[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createEmployee: async (data) => {
    set({ loading: true });
    try {
      await m14Service.createEmployee(data);
      const res = await m14Service.getEmployees();
      set({ employees: extractItems(res) as Employee[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateEmployee: async (id, data) => {
    set({ loading: true });
    try {
      await m14Service.updateEmployee(id, data);
      const res = await m14Service.getEmployees();
      set({ employees: extractItems(res) as Employee[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeEmployee: async (id) => {
    set({ loading: true });
    try {
      await m14Service.deleteEmployee(id);
      const res = await m14Service.getEmployees();
      set({ employees: extractItems(res) as Employee[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  changeEmployeeStatus: async (id, status) => {
    try {
      await m14Service.changeEmployeeStatus(id, status);
      const res = await m14Service.getEmployees();
      set({ employees: extractItems(res) as Employee[] });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  // 考勤
  fetchAttendance: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m14Service.getAttendance(params);
      set({ attendance: extractItems(res) as AttendanceRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createAttendance: async (data) => {
    set({ loading: true });
    try {
      await m14Service.createAttendance(data);
      const res = await m14Service.getAttendance();
      set({ attendance: extractItems(res) as AttendanceRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateAttendance: async (id, data) => {
    set({ loading: true });
    try {
      await m14Service.updateAttendance(id, data);
      const res = await m14Service.getAttendance();
      set({ attendance: extractItems(res) as AttendanceRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeAttendance: async (id) => {
    set({ loading: true });
    try {
      await m14Service.deleteAttendance(id);
      const res = await m14Service.getAttendance();
      set({ attendance: extractItems(res) as AttendanceRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // 薪资
  fetchSalary: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m14Service.getSalary(params);
      set({ salary: extractItems(res) as SalaryRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createSalary: async (data) => {
    set({ loading: true });
    try {
      await m14Service.createSalary(data);
      const res = await m14Service.getSalary();
      set({ salary: extractItems(res) as SalaryRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateSalary: async (id, data) => {
    set({ loading: true });
    try {
      await m14Service.updateSalary(id, data);
      const res = await m14Service.getSalary();
      set({ salary: extractItems(res) as SalaryRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeSalary: async (id) => {
    set({ loading: true });
    try {
      await m14Service.deleteSalary(id);
      const res = await m14Service.getSalary();
      set({ salary: extractItems(res) as SalaryRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  changeSalaryStatus: async (id, status) => {
    try {
      await m14Service.changeSalaryStatus(id, status);
      const res = await m14Service.getSalary();
      set({ salary: extractItems(res) as SalaryRecord[] });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  // 培训
  fetchTraining: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m14Service.getTraining(params);
      set({ training: extractItems(res) as TrainingRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createTraining: async (data) => {
    set({ loading: true });
    try {
      await m14Service.createTraining(data);
      const res = await m14Service.getTraining();
      set({ training: extractItems(res) as TrainingRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updateTraining: async (id, data) => {
    set({ loading: true });
    try {
      await m14Service.updateTraining(id, data);
      const res = await m14Service.getTraining();
      set({ training: extractItems(res) as TrainingRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removeTraining: async (id) => {
    set({ loading: true });
    try {
      await m14Service.deleteTraining(id);
      const res = await m14Service.getTraining();
      set({ training: extractItems(res) as TrainingRecord[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  changeTrainingStatus: async (id, status) => {
    try {
      await m14Service.changeTrainingStatus(id, status);
      const res = await m14Service.getTraining();
      set({ training: extractItems(res) as TrainingRecord[] });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },

  // 绩效
  fetchPerformance: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await m14Service.getPerformance(params);
      set({ performance: extractItems(res) as PerformanceReview[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createPerformance: async (data) => {
    set({ loading: true });
    try {
      await m14Service.createPerformance(data);
      const res = await m14Service.getPerformance();
      set({ performance: extractItems(res) as PerformanceReview[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  updatePerformance: async (id, data) => {
    set({ loading: true });
    try {
      await m14Service.updatePerformance(id, data);
      const res = await m14Service.getPerformance();
      set({ performance: extractItems(res) as PerformanceReview[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  removePerformance: async (id) => {
    set({ loading: true });
    try {
      await m14Service.deletePerformance(id);
      const res = await m14Service.getPerformance();
      set({ performance: extractItems(res) as PerformanceReview[], loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  changePerformanceStatus: async (id, status) => {
    try {
      await m14Service.changePerformanceStatus(id, status);
      const res = await m14Service.getPerformance();
      set({ performance: extractItems(res) as PerformanceReview[] });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    }
  },
}));
