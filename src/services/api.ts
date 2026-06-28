import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// 请求拦截：注入 token
// ============================================================
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// 响应拦截：解包 { code, data, message }
// ============================================================
api.interceptors.response.use(
  (res: any) => {
    if (
      res.data &&
      typeof res.data === 'object' &&
      'code' in res.data &&
      'data' in res.data
    ) {
      if (res.data.code === 0) {
        res.data = res.data.data;
      } else {
        return Promise.reject({
          response: { status: 400, data: res.data },
        });
      }
    }
    return res;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/shelf-erp/login';
    }
    return Promise.reject(error);
  }
);

export default api;
