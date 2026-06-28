import api from './api';
import type {
  InquiryOption,
  QuotationPrediction,
  QueryPredictionParams,
} from '../types/m18';

const BASE = '/m18';

export function getInquiryOptions(): Promise<InquiryOption[]> {
  return api.get(`${BASE}/inquiries`);
}

export function predictQuotation(inquiryId: string): Promise<QuotationPrediction> {
  return api.post(`${BASE}/predict`, { inquiryId });
}

export function getPredictions(params?: QueryPredictionParams): Promise<{ data: QuotationPrediction[]; total: number }> {
  return api.get(`${BASE}/predictions`, { params });
}

export function confirmPrediction(id: string, actualPrice: number): Promise<QuotationPrediction> {
  return api.put(`${BASE}/predictions/${id}/confirm`, { actualPrice });
}
