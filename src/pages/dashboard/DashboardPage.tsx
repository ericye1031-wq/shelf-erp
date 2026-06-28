import { useEffect, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Alert } from '@mui/material';
import RevenueIcon from '@mui/icons-material/TrendingUp';
import OrderIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import CustomerIcon from '@mui/icons-material/People';
import DeliveryIcon from '@mui/icons-material/Schedule';
import ProductionIcon from '@mui/icons-material/Build';
import AlertIcon from '@mui/icons-material/Warning';
import CostIcon from '@mui/icons-material/AttachMoney';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM02Store } from '@/stores/useM02Store';
import { useM06Store } from '@/stores/useM06Store';
import { useM07Store } from '@/stores/useM07Store';
import { useM10Store } from '@/stores/useM10Store';
import { useM11Store } from '@/stores/useM11Store';
import { useM12Store } from '@/stores/useM12Store';
import { formatMoney } from '@/utils/format';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

/** 模拟最近6个月营收数据 */
const MOCK_REVENUE = [
  { month: '1月', value: 580000 },
  { month: '2月', value: 420000 },
  { month: '3月', value: 710000 },
  { month: '4月', value: 630000 },
  { month: '5月', value: 890000 },
  { month: '6月', value: 950000 },
];

/** 工单状态标签映射 */
const WORK_ORDER_STATUS_MAP: Record<string, string> = {
  draft: '待发布',
  released: '已发布',
  in_progress: '进行中',
  completed: '已完成',
  closed: '已关闭',
};

export default function DashboardPage() {
  const { customers, loading: m02Loading, error: m02Error, fetchCustomers } = useM02Store();
  const contracts = useM06Store((s) => s.contracts) ?? [];
  const m06Loading = useM06Store((s) => s.loading);
  const m06Error = useM06Store((s) => s.error);
  const fetchContracts = useM06Store((s) => s.fetchContracts);

  const projects = useM07Store((s) => s.projects) ?? [];
  const alerts = useM07Store((s) => s.alerts) ?? [];
  const m07Loading = useM07Store((s) => s.loading);
  const m07Error = useM07Store((s) => s.error);
  const fetchProjects = useM07Store((s) => s.fetchProjects);
  const fetchAlerts = useM07Store((s) => s.fetchAlerts);

  const workOrders = useM10Store((s) => s.workOrders) ?? [];
  const m10Loading = useM10Store((s) => s.loading);
  const m10Error = useM10Store((s) => s.error);
  const fetchWorkOrders = useM10Store((s) => s.fetchWorkOrders);

  const batches = useM11Store((s) => s.batches) ?? [];
  const m11Loading = useM11Store((s) => s.loading);
  const m11Error = useM11Store((s) => s.error);
  const fetchBatches = useM11Store((s) => s.fetchBatches);

  const dimensions = useM12Store((s) => s.dimensions) ?? [];
  const m12Loading = useM12Store((s) => s.loading);
  const m12Error = useM12Store((s) => s.error);
  const fetchDimensions = useM12Store((s) => s.fetchDimensions);

  const loading = m02Loading || m06Loading || m07Loading || m10Loading || m11Loading || m12Loading;
  const error = m02Error || m06Error || m07Error || m10Error || m11Error || m12Error;

  useEffect(() => {
    fetchCustomers();
    fetchContracts();
    fetchProjects();
    fetchAlerts();
    fetchWorkOrders();
    fetchBatches();
    fetchDimensions();
  }, [fetchCustomers, fetchContracts, fetchProjects, fetchAlerts, fetchWorkOrders, fetchBatches, fetchDimensions]);

  const metrics: MetricCardProps[] = useMemo(() => {
    const activeContracts = (contracts ?? []).filter((c: any) => c.status !== 'draft');
    const revenue = activeContracts.reduce((s: number, c: any) => s + (c.totalAmount || 0), 0);
    const inProgressOrders = (workOrders ?? []).filter((wo: any) => wo.status === 'in_progress').length;
    const inProgressProjects = (projects ?? []).filter((p: any) => p.status === 'in_progress').length;
    const inProduction = (workOrders ?? []).filter((wo: any) => wo.status === 'in_progress' || wo.status === 'released').length;
    const unreadAlerts = (alerts ?? []).filter((a: any) => !a.isRead).length;
    const costTotal = (dimensions ?? []).reduce((s: number, d: any) => s + (d.actualAmount || 0), 0);

    return [
      { title: '本月营收', value: formatMoney(revenue), icon: <RevenueIcon />, color: '#005591' },
      { title: '进行中订单', value: String(inProgressOrders), icon: <OrderIcon />, color: '#2271B3' },
      { title: '库存SKU', value: String(batches.length), icon: <InventoryIcon />, color: '#ED6C02' },
      { title: '活跃客户', value: String(customers.length), icon: <CustomerIcon />, color: '#2E7D32' },
      { title: '待交付项目', value: String(inProgressProjects), icon: <DeliveryIcon />, color: '#9C27B0' },
      { title: '生产中工单', value: String(inProduction), icon: <ProductionIcon />, color: '#0288D1' },
      { title: '预警事项', value: String(unreadAlerts), icon: <AlertIcon />, color: '#F44611' },
      { title: '本月成本', value: formatMoney(costTotal), icon: <CostIcon />, color: '#D32F2F' },
    ];
  }, [contracts, workOrders, projects, alerts, batches, customers, dimensions]);

  /** 工单状态分布 */
  const woStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((wo) => {
      counts[wo.status] = (counts[wo.status] || 0) + 1;
    });
    return Object.entries(WORK_ORDER_STATUS_MAP).map(([status, label]) => ({
      status,
      label,
      count: counts[status] || 0,
      total: workOrders.length,
    }));
  }, [workOrders]);

  /** 项目进度概览（前5个） */
  const topProjects = useMemo(() => projects.slice(0, 5), [projects]);

  const maxRevenue = Math.max(...MOCK_REVENUE.map((r) => r.value), 1);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>董事长驾驶舱</Typography>
      <Grid container spacing={2}>
        {metrics.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.title}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      {/* 图表区域 */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* 营收趋势 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>营收趋势</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 180 }}>
                {MOCK_REVENUE.map((item) => (
                  <Box key={item.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.value >= 10000 ? `${(item.value / 10000).toFixed(0)}万` : `${item.value}`}
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: `${(item.value / maxRevenue) * 140}px`,
                        bgcolor: '#005591',
                        borderRadius: 1,
                        minHeight: 8,
                        transition: 'height 0.3s',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">{item.month}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 工单状态分布 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>工单状态分布</Typography>
              {woStatusData.map((item) => (
                <Box key={item.status} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ width: 60, flexShrink: 0 }}>{item.label}</Typography>
                  <Box sx={{ flex: 1, height: 20, bgcolor: '#F5F5F5', borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: item.total > 0 ? `${(item.count / item.total) * 100}%` : '0%',
                        bgcolor: item.status === 'completed' ? '#2E7D32' : item.status === 'in_progress' ? '#0288D1' : item.status === 'released' ? '#2271B3' : item.status === 'closed' ? '#9E9E9E' : '#ED6C02',
                        borderRadius: 1,
                        minWidth: item.count > 0 ? 8 : 0,
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ width: 30, textAlign: 'right', flexShrink: 0 }}>{item.count}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 项目进度概览 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>项目进度概览</Typography>
              {topProjects.length === 0 ? (
                <Typography variant="body2" color="text.secondary">暂无项目数据</Typography>
              ) : (
                topProjects.map((p) => (
                  <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Typography variant="body2" sx={{ width: 160, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</Typography>
                    <Box sx={{ flex: 1, height: 20, bgcolor: '#F5F5F5', borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: `${p.progress}%`,
                          bgcolor: p.progress >= 80 ? '#2E7D32' : p.progress >= 40 ? '#005591' : '#ED6C02',
                          borderRadius: 1,
                          transition: 'width 0.3s',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ width: 40, textAlign: 'right', flexShrink: 0 }}>{p.progress}%</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
