import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import { useM10Store } from '@/stores/useM10Store';
import type { WorkOrder } from '@/types/m10';

const columns: Column<WorkOrder>[] = [
  { id: 'code', label: '工单编号', sortable: true, width: 130 },
  { id: 'bomId', label: 'BOM ID', width: 130 },
  { id: 'shelfConfigId', label: '货架配置ID', width: 130 },
  { id: 'quantity', label: '计划数量', width: 90 },
  { id: 'completedQty', label: '完成数量', width: 90 },
  { id: 'plannedEnd', label: '计划完工', width: 110, render: (r) => r.plannedEnd },
  { id: 'actualEnd', label: '实际完工', width: 110, render: (r) => r.actualEnd ?? '-' },
];

function SummaryCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function FinishedGoodsPage() {
  const { workOrders, loading, fetchWorkOrders } = useM10Store();
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchWorkOrders(); }, [fetchWorkOrders]);

  const completed = useMemo(
    () => workOrders.filter((wo) => wo.status === 'completed'),
    [workOrders],
  );

  const filtered = keyword
    ? completed.filter((wo) => wo.code.includes(keyword))
    : completed;

  const totalQty = completed.reduce((s, wo) => s + wo.completedQty, 0);
  const onTimeCount = completed.filter((wo) => wo.actualEnd && wo.plannedEnd && wo.actualEnd <= wo.plannedEnd).length;
  const onTimeRate = completed.length > 0 ? ((onTimeCount / completed.length) * 100).toFixed(1) : '0.0';

  return (
    <Box>
      <PageHeader title="成品入库" subtitle={`共 ${filtered.length} 个完工工单`} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="本月入库数量" value={String(totalQty)} color="#005591" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="完工工单数" value={String(completed.length)} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="准时完工率" value={`${onTimeRate}%`} color="#ED6C02" />
        </Grid>
      </Grid>

      <SearchBar placeholder="搜索工单编号" value={keyword} onChange={setKeyword} />
      <DataTable<WorkOrder>
        columns={columns}
        rows={filtered}
        rowKey="id"
        loading={loading}
        page={0}
        pageSize={20}
        total={filtered.length}
      />
    </Box>
  );
}
