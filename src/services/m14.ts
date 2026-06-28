import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type {
  Employee,
  AttendanceRecord,
  SalaryRecord,
  TrainingRecord,
  PerformanceReview,
} from '@/types/m14';

const BASE = '/m14';

// ===== 员工 =====
export const getEmployees = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Employee>>(`${BASE}/employees`, { params });

export const getEmployeeById = (id: string) =>
  api.get<Employee>(`${BASE}/employees/${id}`);

export const createEmployee = (data: Record<string, unknown>) =>
  api.post<Employee>(`${BASE}/employees`, data);

export const updateEmployee = (id: string, data: Record<string, unknown>) =>
  api.put<Employee>(`${BASE}/employees/${id}`, data);

export const deleteEmployee = (id: string) =>
  api.delete(`${BASE}/employees/${id}`);

export const changeEmployeeStatus = (id: string, status: string) =>
  api.put<Employee>(`${BASE}/employees/${id}/status`, { status });

// ===== 考勤 =====
export const getAttendance = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AttendanceRecord>>(`${BASE}/attendance`, { params });

export const getAttendanceById = (id: string) =>
  api.get<AttendanceRecord>(`${BASE}/attendance/${id}`);

export const createAttendance = (data: Record<string, unknown>) =>
  api.post<AttendanceRecord>(`${BASE}/attendance`, data);

export const updateAttendance = (id: string, data: Record<string, unknown>) =>
  api.put<AttendanceRecord>(`${BASE}/attendance/${id}`, data);

export const deleteAttendance = (id: string) =>
  api.delete(`${BASE}/attendance/${id}`);

// ===== 薪资 =====
export const getSalary = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SalaryRecord>>(`${BASE}/salary`, { params });

export const getSalaryById = (id: string) =>
  api.get<SalaryRecord>(`${BASE}/salary/${id}`);

export const createSalary = (data: Record<string, unknown>) =>
  api.post<SalaryRecord>(`${BASE}/salary`, data);

export const updateSalary = (id: string, data: Record<string, unknown>) =>
  api.put<SalaryRecord>(`${BASE}/salary/${id}`, data);

export const deleteSalary = (id: string) =>
  api.delete(`${BASE}/salary/${id}`);

export const changeSalaryStatus = (id: string, status: string) =>
  api.put<SalaryRecord>(`${BASE}/salary/${id}/status`, { status });

// ===== 培训 =====
export const getTraining = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<TrainingRecord>>(`${BASE}/training`, { params });

export const getTrainingById = (id: string) =>
  api.get<TrainingRecord>(`${BASE}/training/${id}`);

export const createTraining = (data: Record<string, unknown>) =>
  api.post<TrainingRecord>(`${BASE}/training`, data);

export const updateTraining = (id: string, data: Record<string, unknown>) =>
  api.put<TrainingRecord>(`${BASE}/training/${id}`, data);

export const deleteTraining = (id: string) =>
  api.delete(`${BASE}/training/${id}`);

export const changeTrainingStatus = (id: string, status: string) =>
  api.put<TrainingRecord>(`${BASE}/training/${id}/status`, { status });

// ===== 绩效 =====
export const getPerformance = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PerformanceReview>>(`${BASE}/performance`, { params });

export const getPerformanceById = (id: string) =>
  api.get<PerformanceReview>(`${BASE}/performance/${id}`);

export const createPerformance = (data: Record<string, unknown>) =>
  api.post<PerformanceReview>(`${BASE}/performance`, data);

export const updatePerformance = (id: string, data: Record<string, unknown>) =>
  api.put<PerformanceReview>(`${BASE}/performance/${id}`, data);

export const deletePerformance = (id: string) =>
  api.delete(`${BASE}/performance/${id}`);

export const changePerformanceStatus = (id: string, status: string) =>
  api.put<PerformanceReview>(`${BASE}/performance/${id}/status`, { status });
