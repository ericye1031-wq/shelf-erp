import api from './api';
import type {
  CostTargetOption,
  CostPrediction,
  CostPredictionHistory,
  QueryCostPredictionParams,
} from '../types/m20';

const BASE = '/m20';

export function getCostTargets(): Promise<CostTargetOption[]> {
  return api.get(`${BASE}/targets`);
}

export function predictCost(targetId: string, months: number): Promise<CostPrediction> {
  return api.post(`${BASE}/predict`, { targetId, months });
}

export function getPredictions(params?: QueryCostPredictionParams): Promise<{ data: CostPrediction[]; total: number }> {
  return api.get(`${BASE}/predictions`, { params });
}

export function getPredictionHistory(params?: QueryCostPredictionParams): Promise<{ data: CostPredictionHistory[]; total: number }> {
  return api.get(`${BASE}/history`, { params });
}
