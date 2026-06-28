import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Dashboard, Report, KPI, DataSource, QueryDashboardParams, QueryReportParams, QueryKPIParams, QueryDataSourceParams } from '../types/m17';
import * as m17Service from '../services/m17';

interface M17State {
  // 仪表板
  dashboards: Dashboard[];
  dashboardTotal: number;
  dashboardLoading: boolean;
  
  // 报表
  reports: Report[];
  reportTotal: number;
  reportLoading: boolean;
  
  // KPI指标
  kpis: KPI[];
  kpiTotal: number;
  kpiLoading: boolean;
  
  // 数据源
  dataSources: DataSource[];
  dataSourceTotal: number;
  dataSourceLoading: boolean;

  // 仪表板方法
  fetchDashboards: (params?: QueryDashboardParams) => Promise<void>;
  createDashboard: (data: Partial<Dashboard>) => Promise<void>;
  updateDashboard: (id: number, data: Partial<Dashboard>) => Promise<void>;
  deleteDashboard: (id: number) => Promise<void>;

  // 报表方法
  fetchReports: (params?: QueryReportParams) => Promise<void>;
  createReport: (data: Partial<Report>) => Promise<void>;
  updateReport: (id: number, data: Partial<Report>) => Promise<void>;
  deleteReport: (id: number) => Promise<void>;

  // KPI方法
  fetchKPIs: (params?: QueryKPIParams) => Promise<void>;
  createKPI: (data: Partial<KPI>) => Promise<void>;
  updateKPI: (id: number, data: Partial<KPI>) => Promise<void>;
  deleteKPI: (id: number) => Promise<void>;

  // 数据源方法
  fetchDataSources: (params?: QueryDataSourceParams) => Promise<void>;
  createDataSource: (data: Partial<DataSource>) => Promise<void>;
  updateDataSource: (id: number, data: Partial<DataSource>) => Promise<void>;
  deleteDataSource: (id: number) => Promise<void>;
}

export const useM17Store = create<M17State>()(
  immer((set, get) => ({
    // 初始状态
    dashboards: [],
    dashboardTotal: 0,
    dashboardLoading: false,
    
    reports: [],
    reportTotal: 0,
    reportLoading: false,
    
    kpis: [],
    kpiTotal: 0,
    kpiLoading: false,
    
    dataSources: [],
    dataSourceTotal: 0,
    dataSourceLoading: false,

    // ==================== 仪表板 ====================
    fetchDashboards: async (params) => {
      set({ dashboardLoading: true });
      try {
        const res = await m17Service.getDashboards(params);
        set({
          dashboards: res.data,
          dashboardTotal: res.total,
          dashboardLoading: false,
        });
      } catch (error) {
        set({ dashboardLoading: false });
        throw error;
      }
    },

    createDashboard: async (data) => {
      await m17Service.createDashboard(data);
      await get().fetchDashboards();
    },

    updateDashboard: async (id, data) => {
      await m17Service.updateDashboard(id, data);
      await get().fetchDashboards();
    },

    deleteDashboard: async (id) => {
      await m17Service.deleteDashboard(id);
      await get().fetchDashboards();
    },

    // ==================== 报表 ====================
    fetchReports: async (params) => {
      set({ reportLoading: true });
      try {
        const res = await m17Service.getReports(params);
        set({
          reports: res.data,
          reportTotal: res.total,
          reportLoading: false,
        });
      } catch (error) {
        set({ reportLoading: false });
        throw error;
      }
    },

    createReport: async (data) => {
      await m17Service.createReport(data);
      await get().fetchReports();
    },

    updateReport: async (id, data) => {
      await m17Service.updateReport(id, data);
      await get().fetchReports();
    },

    deleteReport: async (id) => {
      await m17Service.deleteReport(id);
      await get().fetchReports();
    },

    // ==================== KPI ====================
    fetchKPIs: async (params) => {
      set({ kpiLoading: true });
      try {
        const res = await m17Service.getKPIs(params);
        set({
          kpis: res.data,
          kpiTotal: res.total,
          kpiLoading: false,
        });
      } catch (error) {
        set({ kpiLoading: false });
        throw error;
      }
    },

    createKPI: async (data) => {
      await m17Service.createKPI(data);
      await get().fetchKPIs();
    },

    updateKPI: async (id, data) => {
      await m17Service.updateKPI(id, data);
      await get().fetchKPIs();
    },

    deleteKPI: async (id) => {
      await m17Service.deleteKPI(id);
      await get().fetchKPIs();
    },

    // ==================== 数据源 ====================
    fetchDataSources: async (params) => {
      set({ dataSourceLoading: true });
      try {
        const res = await m17Service.getDataSources(params);
        set({
          dataSources: res.data,
          dataSourceTotal: res.total,
          dataSourceLoading: false,
        });
      } catch (error) {
        set({ dataSourceLoading: false });
        throw error;
      }
    },

    createDataSource: async (data) => {
      await m17Service.createDataSource(data);
      await get().fetchDataSources();
    },

    updateDataSource: async (id, data) => {
      await m17Service.updateDataSource(id, data);
      await get().fetchDataSources();
    },

    deleteDataSource: async (id) => {
      await m17Service.deleteDataSource(id);
      await get().fetchDataSources();
    },
  }))
);
