import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, TextField, MenuItem } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM12Store } from '@/stores/useM12Store';
import type { CostDimension } from '@/types/m12';

const CATEGORY_LABELS: Record<string, string> = { material: '材料', labor: '人工', overhead: '制造费用', outsourcing: '外协', logistics: '物流', other: '其他' };

const columns: Column<CostDimension>[] = [
  { id: 'projectId', label: '项目', width: 130 },
  { id: 'category', label: '类别', width: 80, render: (r) => CATEGORY_LABELS[r.category] || r.category },
  { id: 'budgetAmount', label: '预算', width: 100, align: 'right', render: (r) => `¥${r.budgetAmount.toFixed(2)}` },
  { id: 'actualAmount', label: '实际', width: 100, align: 'right', render: (r) => `¥${r.actualAmount.toFixed(2)}` },
  { id: 'committedAmount', label: '已承诺', width: 100, align: 'right', render: (r) => `¥${r.committedAmount.toFixed(2)}` },
  { id: 'remainingBudget', label: '剩余', width: 100, align: 'right', render: (r) => <span style={{ color: r.remainingBudget < 0 ? '#e53935' : '#2e7d32' }}>¥{r.remainingBudget.toFixed(2)}</span> },
  { id: 'period', label: '期间', width: 80 },
];

export default function CostAnalysisPage() {
  const { dimensions, loading, fetchDimensions } = useM12Store();
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => { fetchDimensions(); }, [fetchDimensions]);

  const filtered = categoryFilter ? dimensions.filter((d) => d.category === categoryFilter) : dimensions;
  const totalBudget = filtered.reduce((s, d) => s + d.budgetAmount, 0);
  const totalActual = filtered.reduce((s, d) => s + d.actualAmount, 0);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="成本分析" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h6">¥{totalBudget.toFixed(0)}</Typography><Typography variant="body2" color="text.secondary">预算总额</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h6" color="error">¥{totalActual.toFixed(0)}</Typography><Typography variant="body2" color="text.secondary">实际成本</Typography></CardContent></Card></Grid>
        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h6" color={totalActual > totalBudget ? 'error' : 'success'}>{totalBudget ? `${(((totalActual - totalBudget) / totalBudget) * 100).toFixed(1)}%` : '-'}</Typography><Typography variant="body2" color="text.secondary">偏差率</Typography></CardContent></Card></Grid>
      </Grid>
      <TextField select size="small" label="类别筛选" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} sx={{ mb: 2, minWidth: 140 }}>
        <MenuItem value="">全部</MenuItem>
        {Object.entries(CATEGORY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
      </TextField>
      <DataTable columns={columns} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={50} total={filtered.length} />
    </Box>
  );
}
