import { useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, LinearProgress, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';

export default function ProductionProgressPage() {
  const { workOrders, loading, fetchWorkOrders } = useM10Store();

  useEffect(() => { fetchWorkOrders(); }, [fetchWorkOrders]);

  const total = workOrders.length;
  const completed = workOrders.filter((w) => w.status === 'completed').length;
  const inProgress = workOrders.filter((w) => w.status === 'in_progress' || w.status === 'released').length;
  const onTimeCount = workOrders.filter((w) => w.status === 'completed' && w.actualEnd && w.plannedEnd && w.actualEnd <= w.plannedEnd).length;
  const onTimeRate = completed > 0 ? ((onTimeCount / completed) * 100).toFixed(1) : '0.0';

  const activeOrders = useMemo(
    () => workOrders.filter((w) => w.status !== 'completed' && w.status !== 'cancelled'),
    [workOrders],
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="生产进度" subtitle={`${activeOrders.length} 个进行中工单`} />

      {/* 进度统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '总工单数', value: total, color: '#005591' },
          { label: '进行中', value: inProgress, color: '#ED6C02' },
          { label: '已完成', value: completed, color: '#2E7D32' },
          { label: '准时率', value: `${onTimeRate}%`, color: '#7B1FA2' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 进行中工单列表 */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#005591' }}>进行中工单</Typography>
      {activeOrders.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>当前无进行中的工单</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                {['工单编号', 'BOM ID', '计划数量', '已完成', '进度', '计划完工'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#005591' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {activeOrders.map((wo) => {
                const pct = Math.min(100, (wo.completedQty / Math.max(1, wo.quantity)) * 100);
                return (
                  <TableRow key={wo.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{wo.code}</TableCell>
                    <TableCell>{wo.bomId ?? '-'}</TableCell>
                    <TableCell align="right">{wo.quantity}</TableCell>
                    <TableCell align="right">{wo.completedQty}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={pct >= 80 ? 'success' : pct >= 40 ? 'warning' : 'primary'}
                        />
                        <Typography variant="caption" sx={{ minWidth: 36 }}>{pct.toFixed(0)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{wo.plannedEnd ?? '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
