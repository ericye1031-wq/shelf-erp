import { useAuthStore } from '@/stores/useAuthStore';

/** 判断是否拥有指定权限 */
export function usePermission() {
  const hasPermission = (permissionKey: string): boolean => {
    return useAuthStore.getState().hasPermission(permissionKey);
  };

  const checkPermission = (dimension: string, key: string): boolean => {
    const fullKey = `${dimension}:${key}`;
    return useAuthStore.getState().hasPermission(fullKey);
  };

  return { hasPermission, checkPermission };
}
