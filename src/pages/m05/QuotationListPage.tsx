import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, MenuItem, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useM05Store } from '@/stores/useM05Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Quotation } from '@/types/m05';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', pending_review: '待审批', approved: '已审批',
  sent: '已发送', accepted: '已接受', rejected: '已驳回', expired: '已过期',
};

const columns: Column<Quotation>[] = [
  { id: 'code', label: '报价编号', sortable: true, width: 130 },
  { id: 'customerName', label: '客户', width: 120, render: (r) => r.customerName || '-' },
  { id: 'shelfTypeName', label: '货架类型', width: 110, render: (r) => r.shelfTypeName || '-' },
  { id: 'quantity', label: '数量', width: 70, align: 'right' },
  { id: 'totalPrice', label: '总价', width: 110, align: 'right', render: (r) => `¥${Number(r.totalPrice).toFixed(2)}` },
  { id: 'margin', label: '毛利率', width: 80, align: 'right', render: (r) => `${(Number(r.margin) * 100).toFixed(1)}%` },
  { id: 'version', label: '版本', width: 60, align: 'center' },
  { id: 'status', label: '状态', width: 90, render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status] || r.status} /> },
];

export default function QuotationListPage() {
  const navigate = useNavigate();
  const { quotations, loading, error, fetchQuotations, removeQuotation, submitQuotation } = useM05Store();
  const { onSuccess } = useCrudFeedback();
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteItem, setDeleteItem] = useState<Quotation | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const filtered = statusFilter ? quotations.filter((q) => q.status === statusFilter) : quotations;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="报价列表" action={<Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/m05/quotations/create')}>创建报价</Button>} />
      <TextField select size="small" label="状态筛选" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ mb: 2, minWidth: 160 }}>
        <MenuItem value="">全部</MenuItem>
        {Object.entries(STATUS_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
      </TextField>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey="id"
        loading={loading}
        page={page}
        pageSize={20}
        total={filtered.length}
        onPageChange={setPage}
        actions={[
          { label: '查看', onClick: (row) => navigate(`/m05/quotations/compare?quotationId=${(row as Quotation).id}`) },
          { label: '提交', onClick: async (row) => { await submitQuotation((row as Quotation).id); onSuccess('提交成功'); }, hidden: (row) => (row as Quotation).status !== 'draft' },
          { label: '删除', onClick: (row) => setDeleteItem(row as Quotation), color: 'error' },
        ]}
      />
      <ConfirmDialog open={!!deleteItem} title="确认删除" content={`确定要删除报价 "${deleteItem?.code}" 吗？`} onConfirm={async () => { if (deleteItem) { await removeQuotation(deleteItem.id); setDeleteItem(null); onSuccess('删除成功'); } }} onCancel={() => setDeleteItem(null)} />
    </Box>
  );
}
