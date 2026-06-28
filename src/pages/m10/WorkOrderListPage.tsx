import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { WorkOrder } from '@/types/m10';
import { formatDate } from '@/utils/format';

const STATUS_LABELS: Record<string, string> = { pending: '待发布', released: '已发布', in_progress: '进行中', completed: '已完成', closed: '已关闭' };
const PRIORITY_LABELS: Record<string, string> = { low: '低', normal: '普通', high: '高', urgent: '紧急' };

const columns: Column<WorkOrder>[] = [
  { id: 'code', label: '工单号', sortable: true, width: 130 },
  { id: 'bomId', label: 'BOM', width: 130 },
  { id: 'quantity', label: '计划数', width: 70, align: 'right' },
  { id: 'completedQty', label: '完成数', width: 70, align: 'right' },
  { id: 'priority', label: '优先级', width: 70, render: (r) => <StatusBadge status={r.priority} label={PRIORITY_LABELS[r.priority] || r.priority} /> },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status] || r.status} /> },
  { id: 'plannedStart', label: '计划开始', width: 100, render: (r) => (r.plannedStart) ? formatDate(r.plannedStart) : "-" },
  { id: 'plannedEnd', label: '计划结束', width: 100, render: (r) => (r.plannedEnd) ? formatDate(r.plannedEnd) : "-" },
];

export default function WorkOrderListPage() {
  const navigate = useNavigate();
  const { workOrders, loading, fetchWorkOrders } = useM10Store();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => { fetchWorkOrders(); }, [fetchWorkOrders]);

  const filtered = statusFilter ? workOrders.filter((w) => w.status === statusFilter) : workOrders;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="工单管理" />
      <TextField select size="small" label="状态" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ mb: 2, minWidth: 140 }}>
        <MenuItem value="">全部</MenuItem>
        {Object.entries(STATUS_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
      </TextField>
      <DataTable columns={columns} rows={filtered} rowKey="id" loading={loading} page={page} pageSize={20} total={filtered.length} onPageChange={setPage}
        actions={[{ label: '查看', onClick: (row) => navigate(`/m10/work-orders/${(row as WorkOrder).id}`) }]} />
    </Box>
  );
}
