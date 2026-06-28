import { create } from 'zustand';

interface CostTarget { id: string; code: string; name: string; }
interface CostPrediction { id: string; materialCode: string; materialName: string; predictedPrice3m: number; predictedPrice6m: number; historicalPrice?: number; confidenceLower: number; confidenceUpper: number; trend?: number[]; months?: string[]; createdAt: string; }
interface M20State {
  targets: CostTarget[]; predictions: CostPrediction[];
  history: CostPrediction[]; currentPrediction: CostPrediction | null;
  predicting: boolean; loading: boolean; error: string | null;
  fetchTargets: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  runPrediction: (targetId: string, months: number) => Promise<void>;
}

export const useM20Store = create<M20State>((set, get) => ({
  targets: [], predictions: [], history: [], currentPrediction: null,
  predicting: false, loading: false, error: null,

  fetchTargets: async () => {
    try {
      const res = await fetch('/api/m20/ai-cost-prediction?type=targets');
      const json = await res.json();
      const items = json.data || [
        { id: 'STEEL_Q235', code: 'STEEL_Q235', name: 'Q235B閽㈡澘' },
        { id: 'STEEL_45', code: 'STEEL_45', name: '45#閽? },
        { id: 'POWDER_EP', code: 'POWDER_EP', name: '鐜哀绮夋湯娑傛枡' },
        { id: 'BOLT_M8', code: 'BOLT_M8', name: 'M8铻烘爴' },
      ];
      set({ targets: items.map((i: any) => ({ id: i.id || i.code, code: i.code || i.id, name: i.name || i.materialName || i.code })) });
    } catch {}
  },

  fetchPredictions: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/m20/ai-cost-prediction');
      const json = await res.json();
      set({ predictions: json.data || [], loading: false });
    } catch { set({ loading: false }); }
  },

  fetchHistory: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/m20/ai-cost-prediction?type=history');
      const json = await res.json();
      set({ history: json.data || (json as any).items || [], loading: false });
    } catch { set({ loading: false }); }
  },

  runPrediction: async (targetId: string, months: number) => {
    set({ predicting: true, error: null });
    try {
      const res = await fetch('/api/m20/ai-cost-prediction/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, months }),
      });
      const json = await res.json();
      if (json.data) {
        set((s) => ({
          currentPrediction: json.data,
          predictions: [json.data, ...s.predictions],
          predicting: false,
        }));
      } else { set({ predicting: false, error: json.message || '棰勬祴澶辫触' }); }
    } catch (e: any) { set({ predicting: false, error: e.message }); }
  },
}));

