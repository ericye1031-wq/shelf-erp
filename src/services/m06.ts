import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Contract, PaymentPlan, Invoice } from '@/types/m06';

const BASE = '/m06';

export const getContracts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Contract>>(`${BASE}/contracts`, { params });

export const getContractById = (id: string) =>
  api.get<Contract>(`${BASE}/contracts/${id}`);

export const createContract = (data: Partial<Contract>) =>
  api.post<Contract>(`${BASE}/contracts`, data);

export const updateContract = (id: string, data: Partial<Contract>) =>
  api.put<Contract>(`${BASE}/contracts/${id}`, data);

export const deleteContract = (id: string) =>
  api.delete(`${BASE}/contracts/${id}`);

export const submitContract = (id: string) =>
  api.post<Contract>(`${BASE}/contracts/${id}/submit`);

export const approveContract = (id: string) =>
  api.post<Contract>(`${BASE}/contracts/${id}/approve`);

export const getPayments = (contractId: string) =>
  api.get<PaymentPlan[]>(`${BASE}/contracts/${contractId}/payments`);

export const createPayment = (contractId: string, data: Partial<PaymentPlan>) =>
  api.post<PaymentPlan>(`${BASE}/contracts/${contractId}/payments`, data);

export const updatePayment = (contractId: string, id: string, data: Partial<PaymentPlan>) =>
  api.put<PaymentPlan>(`${BASE}/contracts/${contractId}/payments/${id}`, data);

export const confirmPayment = (contractId: string, id: string, actualDate: string) =>
  api.post<PaymentPlan>(`${BASE}/contracts/${contractId}/payments/${id}/confirm`, { actualDate });

export const getInvoices = (contractId: string) =>
  api.get<Invoice[]>(`${BASE}/contracts/${contractId}/invoices`);

export const createInvoice = (contractId: string, data: Partial<Invoice>) =>
  api.post<Invoice>(`${BASE}/contracts/${contractId}/invoices`, data);

export const updateInvoice = (contractId: string, id: string, data: Partial<Invoice>) =>
  api.put<Invoice>(`${BASE}/contracts/${contractId}/invoices/${id}`, data);
