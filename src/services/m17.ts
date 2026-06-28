import api from './api';
import type {
  Dashboard,
  Report,
  KPI,
  DataSource,
  QueryDashboardParams,
  QueryReportParams,
  QueryKPIParams,
  QueryDataSourceParams,
} from '../types/m17';

// ==================== 浠〃鏉?API ====================

export async function getDashboards(params?: QueryDashboardParams): Promise<{ data: Dashboard[]; total: number }> {
  return api.get('/api/m17/dashboards', { params });
}

export async function getDashboardById(id: number): Promise<Dashboard> {
  return api.get(`/api/m17/dashboards/${id}`);
}

export async function createDashboard(data: Partial<Dashboard>): Promise<Dashboard> {
  return api.post('/api/m17/dashboards', data);
}

export async function updateDashboard(id: number, data: Partial<Dashboard>): Promise<Dashboard> {
  return api.put(`/api/m17/dashboards/${id}`, data);
}

export async function deleteDashboard(id: number): Promise<void> {
  return api.delete(`/api/m17/dashboards/${id}`);
}

// ==================== 鎶ヨ〃 API ====================

export async function getReports(params?: QueryReportParams): Promise<{ data: Report[]; total: number }> {
  return api.get('/api/m17/reports', { params });
}

export async function getReportById(id: number): Promise<Report> {
  return api.get(`/api/m17/reports/${id}`);
}

export async function createReport(data: Partial<Report>): Promise<Report> {
  return api.post('/api/m17/reports', data);
}

export async function updateReport(id: number, data: Partial<Report>): Promise<Report> {
  return api.put(`/api/m17/reports/${id}`, data);
}

export async function deleteReport(id: number): Promise<void> {
  return api.delete(`/api/m17/reports/${id}`);
}

// ==================== KPI鎸囨爣 API ====================

export async function getKPIs(params?: QueryKPIParams): Promise<{ data: KPI[]; total: number }> {
  return api.get('/api/m17/kpis', { params });
}

export async function getKPIById(id: number): Promise<KPI> {
  return api.get(`/api/m17/kpis/${id}`);
}

export async function createKPI(data: Partial<KPI>): Promise<KPI> {
  return api.post('/api/m17/kpis', data);
}

export async function updateKPI(id: number, data: Partial<KPI>): Promise<KPI> {
  return api.put(`/api/m17/kpis/${id}`, data);
}

export async function deleteKPI(id: number): Promise<void> {
  return api.delete(`/api/m17/kpis/${id}`);
}

// ==================== 鏁版嵁婧?API ====================

export async function getDataSources(params?: QueryDataSourceParams): Promise<{ data: DataSource[]; total: number }> {
  return api.get('/api/m17/data-sources', { params });
}

export async function getDataSourceById(id: number): Promise<DataSource> {
  return api.get(`/api/m17/data-sources/${id}`);
}

export async function createDataSource(data: Partial<DataSource>): Promise<DataSource> {
  return api.post('/api/m17/data-sources', data);
}

export async function updateDataSource(id: number, data: Partial<DataSource>): Promise<DataSource> {
  return api.put(`/api/m17/data-sources/${id}`, data);
}

export async function deleteDataSource(id: number): Promise<void> {
  return api.delete(`/api/m17/data-sources/${id}`);
}

