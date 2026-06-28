import { create } from 'zustand';

interface AiQuotation {
  id: string; inquiryId: string; inquiryTitle?: string; shelfType: string;
  predictedLow: number; predictedHigh: number; confidence: number;
  breakdown?: { materialCost: number; laborCost: number; overheadCost: number; profit: number };
  predictedAt: string; createdAt: string;
}
interface InquiryOption { id: string; title: string; }

interface M18State {
  inquiries: InquiryOption[];
  predictions: AiQuotation[];
  currentPrediction: AiQuotation | null;
  predicting: boolean; loading: boolean; error: string | null;
  fetchInquiries: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
  runPrediction: (inquiryId: string) => Promise<void>;
}

export const useM18Store = create<M18State>((set, get) => ({
  inquiries: [], predictions: [], currentPrediction: null,
  predicting: false, loading: false, error: null,

  fetchInquiries: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/m18/ai-quotation?type=inquiries');
      const json = await res.json();
      set({ inquiries: (json.data || []).map((q: any) => ({ id: q.id || q.inquiryId, title: q.shelfType || q.inquiryTitle || q.id })), loading: false });
    } catch { set({ loading: false }); }
  },

  fetchPredictions: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/m18/ai-quotation');
      const json = await res.json();
      set({ predictions: json.data || [], loading: false });
    } catch { set({ loading: false }); }
  },

  runPrediction: async (inquiryId: string) => {
    set({ predicting: true, error: null });
    try {
      const res = await fetch('/api/m18/ai-quotation/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId }),
      });
      const json = await res.json();
      if (json.data) {
        set((s) => ({
          currentPrediction: { ...json.data, predictedLow: json.data.predictedPriceLow ?? json.data.predictedLow, predictedHigh: json.data.predictedPriceHigh ?? json.data.predictedHigh },
          predictions: [json.data, ...s.predictions],
          predicting: false,
        }));
      } else { set({ predicting: false, error: json.message }); }
    } catch (e: any) { set({ predicting: false, error: e.message }); }
  },
}));
