import type { AuditFields } from './common';

/** 询价来源 */
export interface InquiryOption {
  id: string;
  code: string;
  customerName: string;
  description: string;
}

/** AI报价预测结果 */
export interface QuotationPrediction {
  id: string;
  inquiryId: string;
  inquiryCode: string;
  predictedLow: number;
  predictedHigh: number;
  confidence: number;
  materialCost: number;
  laborCost: number;
  overhead: number;
  predictedAt: string;
  actualPrice?: number;
  accuracy?: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

/** 报价预测查询参数 */
export interface QueryPredictionParams {
  inquiryId?: string;
  page?: number;
  pageSize?: number;
}

/** M18 AI智能报价 state */
export interface M18State {
  inquiries: InquiryOption[];
  predictions: QuotationPrediction[];
  currentPrediction: QuotationPrediction | null;
  predicting: boolean;
  loading: boolean;
  error: string | null;
}
