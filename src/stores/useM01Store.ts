import { create } from 'zustand';
import type { Organization, User, Role, Dictionary, SystemLog, SystemConfig } from '@/types/m01';
import * as m01Service from '@/services/m01';

interface M01State {
  organizations: Organization[];
  users: User[];
  roles: Role[];
  dictionaries: Dictionary[];
  logs: SystemLog[];
  configs: SystemConfig[];
  currentOrg: Organization | null;
  currentUser: User | null;
  currentRole: Role | null;
  loading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchDictionaries: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchConfigs: () => Promise<void>;
  fetchOrgById: (id: string) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  fetchRoleById: (id: string) => Promise<void>;
  createOrg: (data: Partial<Organization>) => Promise<void>;
  createUser: (data: Partial<User>) => Promise<void>;
  createRole: (data: Partial<Role>) => Promise<void>;
  createDict: (data: Partial<Dictionary>) => Promise<void>;
  updateOrg: (id: string, data: Partial<Organization>) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  updateRole: (id: string, data: Partial<Role>) => Promise<void>;
  updateDict: (id: string, data: Partial<Dictionary>) => Promise<void>;
  updateConfig: (id: string, data: Partial<SystemConfig>) => Promise<void>;
  removeOrg: (id: string) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  removeRole: (id: string) => Promise<void>;
  removeDict: (id: string) => Promise<void>;
}

export const useM01Store = create<M01State>((set) => ({
  organizations: [],
  users: [],
  roles: [],
  dictionaries: [],
  logs: [],
  configs: [],
  currentOrg: null,
  currentUser: null,
  currentRole: null,
  loading: false,
  error: null,

  fetchOrganizations: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getOrganizations();
      set({ organizations: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getUsers();
      set({ users: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getRoles();
      set({ roles: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchDictionaries: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getDictionaries();
      set({ dictionaries: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchLogs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getLogs();
      set({ logs: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getConfigs();
      set({ configs: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchOrgById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getOrganizationById(id);
      set({ currentOrg: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getUserById(id);
      set({ currentUser: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  fetchRoleById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await m01Service.getRoleById(id);
      set({ currentRole: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  createOrg: async (data) => {
    try {
      await m01Service.createOrganization(data);
      const res = await m01Service.getOrganizations();
      set({ organizations: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createUser: async (data) => {
    try {
      await m01Service.createUser(data);
      const res = await m01Service.getUsers();
      set({ users: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createRole: async (data) => {
    try {
      await m01Service.createRole(data);
      const res = await m01Service.getRoles();
      set({ roles: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createDict: async (data) => {
    try {
      await m01Service.createDictionary(data);
      const res = await m01Service.getDictionaries();
      set({ dictionaries: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateOrg: async (id, data) => {
    try {
      await m01Service.updateOrganization(id, data);
      const res = await m01Service.getOrganizations();
      set({ organizations: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateUser: async (id, data) => {
    try {
      await m01Service.updateUser(id, data);
      const res = await m01Service.getUsers();
      set({ users: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateRole: async (id, data) => {
    try {
      await m01Service.updateRole(id, data);
      const res = await m01Service.getRoles();
      set({ roles: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateDict: async (id, data) => {
    try {
      await m01Service.updateDictionary(id, data);
      const res = await m01Service.getDictionaries();
      set({ dictionaries: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateConfig: async (id, data) => {
    try {
      await m01Service.updateConfig(id, data);
      const res = await m01Service.getConfigs();
      set({ configs: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeOrg: async (id) => {
    try {
      await m01Service.deleteOrganization(id);
      const res = await m01Service.getOrganizations();
      set({ organizations: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeUser: async (id) => {
    try {
      await m01Service.deleteUser(id);
      const res = await m01Service.getUsers();
      set({ users: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeRole: async (id) => {
    try {
      await m01Service.deleteRole(id);
      const res = await m01Service.getRoles();
      set({ roles: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  removeDict: async (id) => {
    try {
      await m01Service.deleteDictionary(id);
      const res = await m01Service.getDictionaries();
      set({ dictionaries: res.data.items });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
