import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Quotation, QuotationVersion, CostItem, Currency } from '@/types/m05';

const BASE = '/m05';

export const getQuotations = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Quotation>>(`${BASE}/quotations`, { params });

export const getQuotationById = (id: string) =>
  api.get<Quotation>(`${BASE}/quotations/${id}`);

export const createQuotation = (data: Partial<Quotation>) =>
  api.post<Quotation>(`${BASE}/quotations`, data);

export const updateQuotation = (id: string, data: Partial<Quotation>) =>
  api.put<Quotation>(`${BASE}/quotations/${id}`, data);

export const deleteQuotation = (id: string) =>
  api.delete(`${BASE}/quotations/${id}`);

export const getQuotationVersions = (quotationId: string) =>
  api.get<QuotationVersion[]>(`${BASE}/quotations/${quotationId}/versions`);

export const compareVersions = (quotationId: string, v1: number, v2: number) =>
  api.get<{ version1: QuotationVersion; version2: QuotationVersion }>(`${BASE}/quotations/${quotationId}/compare`, { params: { v1, v2 } });

export const getCurrencies = () =>
  api.get<Currency[]>(`${BASE}/currencies`);

export const getCostItems = (quotationId: string) =>
  api.get<CostItem[]>(`${BASE}/quotations/${quotationId}/cost-items`);

export const submitQuotation = (id: string) =>
  api.post<Quotation>(`${BASE}/quotations/${id}/submit`);
