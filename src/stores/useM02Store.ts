import { create } from 'zustand';
import type { Customer, Contact, Opportunity, Inquiry, FollowUp } from '@/types/m02';
import * as m02Service from '@/services/m02';

interface M02State {
  customers: Customer[];
  contacts: Contact[];
  opportunities: Opportunity[];
  inquiries: Inquiry[];
  followups: FollowUp[];
  currentCustomer: Customer | null;
  currentOpportunity: Opportunity | null;
  currentInquiry: Inquiry | null;
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  fetchOpportunities: () => Promise<void>;
  fetchInquiries: () => Promise<void>;
  fetchFollowups: () => Promise<void>;
  fetchCustomerById: (id: string) => Promise<void>;
  fetchContacts: (customerId: string) => Promise<void>;
  fetchOpportunityById: (id: string) => Promise<void>;
  fetchInquiryById: (id: string) => Promise<void>;
  createCustomer: (data: Record<string, unknown>) => Promise<void>;
  createContact: (customerId: string, data: Record<string, unknown>) => Promise<void>;
  createOpportunity: (data: Record<string, unknown>) => Promise<void>;
  createInquiry: (data: Record<string, unknown>) => Promise<void>;
  createFollowup: (data: Record<string, unknown>) => Promise<void>;
  updateCustomer: (id: string, data: Record<string, unknown>) => Promise<void>;
  updateContact: (customerId: string, id: string, data: Record<string, unknown>) => Promise<void>;
  updateOpportunity: (id: string, data: Record<string, unknown>) => Promise<void>;
  updateInquiry: (id: string, data: Record<string, unknown>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  removeContact: (customerId: string, id: string) => Promise<void>;
  removeOpportunity: (id: string) => Promise<void>;
  removeInquiry: (id: string) => Promise<void>;
}

function extractItems(res: { data: unknown }): unknown[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'items' in d) return (d as { items: unknown[] }).items;
  return [];
}

export const useM02Store = create<M02State>((set) => ({
  customers: [],
  contacts: [],
  opportunities: [],
  inquiries: [],
  followups: [],
  currentCustomer: null,
  currentOpportunity: null,
  currentInquiry: null,
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getCustomers();
      set({ customers: extractItems(res) as Customer[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchOpportunities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getOpportunities();
      set({ opportunities: extractItems(res) as Opportunity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getInquiries();
      set({ inquiries: extractItems(res) as Inquiry[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchFollowups: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getFollowups();
      set({ followups: extractItems(res) as FollowUp[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchCustomerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getCustomerById(id);
      set({ currentCustomer: res.data as Customer });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchContacts: async (customerId) => {
    set({ error: null });
    try {
      const res = await m02Service.getContacts(customerId);
      set({ contacts: extractItems(res) as Contact[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fetchOpportunityById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getOpportunityById(id);
      set({ currentOpportunity: res.data as Opportunity });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchInquiryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m02Service.getInquiryById(id);
      set({ currentInquiry: res.data as Inquiry });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createCustomer: async (data) => {
    try {
      await m02Service.createCustomer(data);
      const res = await m02Service.getCustomers();
      set({ customers: extractItems(res) as Customer[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createContact: async (customerId, data) => {
    try {
      await m02Service.createContact(customerId, data);
      const res = await m02Service.getContacts(customerId);
      set({ contacts: extractItems(res) as Contact[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createOpportunity: async (data) => {
    try {
      await m02Service.createOpportunity(data);
      const res = await m02Service.getOpportunities();
      set({ opportunities: extractItems(res) as Opportunity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createInquiry: async (data) => {
    try {
      await m02Service.createInquiry(data);
      const res = await m02Service.getInquiries();
      set({ inquiries: extractItems(res) as Inquiry[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createFollowup: async (data) => {
    try {
      await m02Service.createFollowup(data);
      const res = await m02Service.getFollowups();
      set({ followups: extractItems(res) as FollowUp[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateCustomer: async (id, data) => {
    try {
      await m02Service.updateCustomer(id, data);
      const res = await m02Service.getCustomers();
      set({ customers: extractItems(res) as Customer[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateContact: async (customerId, id, data) => {
    try {
      await m02Service.updateContact(customerId, id, data);
      const res = await m02Service.getContacts(customerId);
      set({ contacts: extractItems(res) as Contact[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateOpportunity: async (id, data) => {
    try {
      await m02Service.updateOpportunity(id, data);
      const res = await m02Service.getOpportunities();
      set({ opportunities: extractItems(res) as Opportunity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateInquiry: async (id, data) => {
    try {
      await m02Service.updateInquiry(id, data);
      const res = await m02Service.getInquiries();
      set({ inquiries: extractItems(res) as Inquiry[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeCustomer: async (id) => {
    try {
      await m02Service.deleteCustomer(id);
      const res = await m02Service.getCustomers();
      set({ customers: extractItems(res) as Customer[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeContact: async (customerId, id) => {
    try {
      await m02Service.deleteContact(customerId, id);
      const res = await m02Service.getContacts(customerId);
      set({ contacts: extractItems(res) as Contact[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeOpportunity: async (id) => {
    try {
      await m02Service.deleteOpportunity(id);
      const res = await m02Service.getOpportunities();
      set({ opportunities: extractItems(res) as Opportunity[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeInquiry: async (id) => {
    try {
      await m02Service.deleteInquiry(id);
      const res = await m02Service.getInquiries();
      set({ inquiries: extractItems(res) as Inquiry[] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
