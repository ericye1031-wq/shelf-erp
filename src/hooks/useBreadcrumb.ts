import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  path: string;
}

/** 路径段 → 中文面包屑 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: '仪表盘',
  login: '登录',
  m01: '系统管理', m02: 'CRM', m03: '财务', m04: '采购', m05: '库存',
  m06: '合同', m07: '项目', m08: '生产', m09: '交付', m10: '质量',
  m11: '设计', m12: '报价',
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    title: SEGMENT_LABELS[seg] || seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
  }));
}
