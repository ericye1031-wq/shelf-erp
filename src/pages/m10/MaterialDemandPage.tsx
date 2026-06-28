import { useEffect, useState, useMemo } from 'react';
import {
  Box, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Card, CardContent, Grid,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { MaterialDemand } from '@/types/m10';

const STATUS_LABELS: Record<string, string> = {
  satisfied: '已满足', short: '短缺', allocated: '已分配', pending: '待分配',
};

export default function MaterialDemandPage() {
  const { materialDemands, loading, fetchMaterialDemands, workOrders, fetchWorkOrders } = useM10Store();
  const [woFilter, setWoFilter] = useState('');

  useEffect(() => {
    fetchMaterialDemands('default');
    fetchWorkOrders();
  }, [fetchMaterialDemands, fetchWorkOrders]);

  const filtered = useMemo(() => {
    return woFilter ? materialDemands.filter((d) => d.workOrderId.includes(woFilter)) : materialDemands;
  }, [materialDemands, woFilter]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const satisfied = filtered.filter((d) => d.status === 'satisfied' || d.shortageQty <= 0).length;
    const short = filtered.filter((d) => d.status === 'short' || d.shortageQty > 0).length;
    return { total, satisfied, short };
  }, [filtered]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="物料需求" subtitle="管理工单物料需求及短缺预警" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>{summary.total}</Typography>
              <Typography variant="caption" color="text.secondary">总物料</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="success.main">{summary.satisfied}</Typography>
              <Typography variant="caption" color="success.main">已满足</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: '#FFEBEE' }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="error.main">{summary.short}</Typography>
              <Typography variant="caption" color="error.main">短缺</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TextField size="small" label="工单ID" value={woFilter}
        onChange={(e) => setWoFilter(e.target.value)} sx={{ mb: 2, minWidth: 200 }} />

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无物料需求数据</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>工单ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>物料</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>规格</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">需求数量</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">可用数量</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">短缺数量</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>单位</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>状态</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((d) => {
                const isShort = d.status === 'short' || d.shortageQty > 0;
                return (
                  <TableRow key={d.id} hover
                    sx={{
                      backgroundColor: isShort ? '#FFF5F5' : undefined,
                      borderLeft: 4,
                      borderColor: isShort ? 'error.main' : 'success.main',
                    }}
                  >
                    <TableCell>{d.workOrderId}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{d.material}</Typography>
                    </TableCell>
                    <TableCell>{d.spec || '-'}</TableCell>
                    <TableCell align="right">{d.requiredQty.toLocaleString()}</TableCell>
                    <TableCell align="right">{d.availableQty.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}
                        color={d.shortageQty > 0 ? 'error' : 'text.primary'}>
                        {d.shortageQty > 0 ? `-${d.shortageQty.toLocaleString()}` : '0'}
                      </Typography>
                    </TableCell>
                    <TableCell>{d.unit || '-'}</TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABELS[d.status] || d.status} size="small"
                        color={isShort ? 'error' : 'success'} />
                    </TableCell>
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
