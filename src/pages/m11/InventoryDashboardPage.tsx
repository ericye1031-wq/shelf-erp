import { useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM11Store } from '@/stores/useM11Store';
import type { InventoryItem } from '@/types/m11';

const columns: Column<InventoryItem>[] = [
  { id: 'material', label: '物料', width: 100 },
  { id: 'spec', label: '规格', width: 120 },
  { id: 'warehouseName', label: '仓库', width: 80 },
  { id: 'locationCode', label: '库位', width: 80 },
  { id: 'batchCode', label: '批次', width: 100 },
  { id: 'quantity', label: '数量', width: 70, align: 'right' },
  { id: 'unit', label: '单位', width: 50 },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={r.status === 'normal' ? '正常' : r.status === 'low' ? '低库存' : r.status === 'overstock' ? '积压' : '冻结'} /> },
];

export default function InventoryDashboardPage() {
  const { inventory, loading, fetchInventory } = useM11Store();

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const lowStock = inventory.filter((i) => i.status === 'low').length;
  const normal = inventory.filter((i) => i.status === 'normal').length;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="库存看板" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card><CardContent><Typography variant="h4">{inventory.length}</Typography><Typography variant="body2" color="text.secondary">总项数</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card><CardContent><Typography variant="h4" color="success.main">{normal}</Typography><Typography variant="body2" color="text.secondary">正常</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card><CardContent><Typography variant="h4" color="warning.main">{lowStock}</Typography><Typography variant="body2" color="text.secondary">低库存预警</Typography></CardContent></Card>
        </Grid>
      </Grid>
      <DataTable columns={columns} rows={inventory} rowKey="id" loading={loading} page={0} pageSize={50} total={inventory.length} />
    </Box>
  );
}
