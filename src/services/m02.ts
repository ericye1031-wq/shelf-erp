import api from './api';
import type { PaginatedResponse } from '@/types/common';
import type { Customer, Contact, Opportunity, Inquiry, FollowUp } from '@/types/m02';

const BASE = '/m02';

export const getCustomers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Customer>>(`${BASE}/customers`, { params });

export const getCustomerById = (id: string) =>
  api.get<Customer>(`${BASE}/customers/${id}`);

export const createCustomer = (data: Partial<Customer>) =>
  api.post<Customer>(`${BASE}/customers`, data);

export const updateCustomer = (id: string, data: Partial<Customer>) =>
  api.put<Customer>(`${BASE}/customers/${id}`, data);

export const deleteCustomer = (id: string) =>
  api.delete(`${BASE}/customers/${id}`);

export const getContacts = (customerId: string) =>
  api.get<Contact[]>(`${BASE}/customers/${customerId}/contacts`);

export const createContact = (customerId: string, data: Partial<Contact>) =>
  api.post<Contact>(`${BASE}/customers/${customerId}/contacts`, data);

export const updateContact = (customerId: string, id: string, data: Partial<Contact>) =>
  api.put<Contact>(`${BASE}/customers/${customerId}/contacts/${id}`, data);

export const deleteContact = (customerId: string, id: string) =>
  api.delete(`${BASE}/customers/${customerId}/contacts/${id}`);

export const getOpportunities = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Opportunity>>(`${BASE}/opportunities`, { params });

export const getOpportunityById = (id: string) =>
  api.get<Opportunity>(`${BASE}/opportunities/${id}`);

export const createOpportunity = (data: Partial<Opportunity>) =>
  api.post<Opportunity>(`${BASE}/opportunities`, data);

export const updateOpportunity = (id: string, data: Partial<Opportunity>) =>
  api.put<Opportunity>(`${BASE}/opportunities/${id}`, data);

export const deleteOpportunity = (id: string) =>
  api.delete(`${BASE}/opportunities/${id}`);

export const getInquiries = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Inquiry>>(`${BASE}/inquiries`, { params });

export const getInquiryById = (id: string) =>
  api.get<Inquiry>(`${BASE}/inquiries/${id}`);

export const createInquiry = (data: Partial<Inquiry>) =>
  api.post<Inquiry>(`${BASE}/inquiries`, data);

export const updateInquiry = (id: string, data: Partial<Inquiry>) =>
  api.put<Inquiry>(`${BASE}/inquiries/${id}`, data);

export const deleteInquiry = (id: string) =>
  api.delete(`${BASE}/inquiries/${id}`);

export const getFollowups = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<FollowUp>>(`${BASE}/followups`, { params });

export const createFollowup = (data: Partial<FollowUp>) =>
  api.post<FollowUp>(`${BASE}/followups`, data);
