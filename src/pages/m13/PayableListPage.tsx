import { useEffect, useState } from 'react';
import {
  Button, Box, Tooltip, IconButton, Card, CardContent, Typography, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM13Store } from '@/stores/useM13Store';
import { formatDate, formatMoney } from '@/utils/format';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { AccountsPayable } from '@/types/m13';

const STATUS_LABELS: Record<string, string> = {
  pending: '待付', partial: '部分付', settled: '已结清', written_off: '已核销',
};

const columns: Column<AccountsPayable>[] = [
  { id: 'payableNo', label: '应付编号', width: 140 },
  { id: 'supplierName', label: '供应商', width: 160 },
  { id: 'amount', label: '应付金额', align: 'right', width: 120,
    render: (r) => formatMoney(r.amount) },
  { id: 'settledAmount', label: '已付金额', align: 'right', width: 120,
    render: (r) => formatMoney(r.settledAmount) },
  { id: 'balance', label: '余额', align: 'right', width: 120,
    render: (r) => <span style={{ color: r.balance > 0 ? '#d32f2f' : '#2e7d32', fontWeight: 600 }}>{formatMoney(r.balance)}</span> },
  { id: 'dueDate', label: '到期日', width: 110,
    render: (r) => r.dueDate ? formatDate(r.dueDate) : '-' },
  { id: 'status', label: '状态', width: 80,
    render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status] || r.status} /> },
];

export default function PayableListPage() {
  const { payables, payableStats, loading, error, fetchPayables, fetchPayableStats, createPayable, removePayable, addPayment } = useM13Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [keyword, setKeyword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AccountsPayable | null>(null);

  useEffect(() => { fetchPayables(); fetchPayableStats(); }, [fetchPayables, fetchPayableStats]);

  const filtered = payables.filter((r) =>
    (r.payableNo || '').includes(keyword) || (r.supplierName || '').includes(keyword)
  );

  const handleDelete = async (id: string, no: string) => {
    if (!window.confirm(`确定删除应付「${no}」？`)) return;
    try {
      await removePayable(id);
      const err = useM13Store.getState().error;
      if (err) onError(err); else onSuccess('删除成功');
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<AccountsPayable> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        {(r.status === 'pending' || r.status === 'partial') && (
          <Tooltip title="付款">
            <IconButton size="small" color="primary" onClick={() => { setSelectedItem(r); setPaymentDrawerOpen(true); }}>
              <PaymentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.payableNo)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  const stats = payableStats;
  return (
    <>
      <PageHeader title="应付管理" subtitle={`共 ${filtered.length} 条应付`}
        action={
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
            新增应付
          </Button>} />
      {error && <Box sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderRadius: 1, color: 'error.main' }}>错误：{error}</Box>}

      {stats && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: '应付总额', value: formatMoney(stats.totalAmount), color: '#1565c0' },
            { label: '已付金额', value: formatMoney(stats.settledAmount), color: '#2e7d32' },
            { label: '未付余额', value: formatMoney(stats.balance), color: '#d32f2f' },
            { label: '逾期数量', value: `${stats.overdueCount}`, color: '#e65100' },
          ].map((card) => (
            <Grid key={card.label} size={{ xs: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                  <Typography variant="h6" sx={{ color: card.color, fontWeight: 700 }}>{card.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <SearchBar placeholder="搜索应付编号/供应商" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<AccountsPayable>
          columns={[...columns, actionColumn]} rows={filtered}
          rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>

      <FormDrawer open={drawerOpen} title="新增应付" onCancel={() => setDrawerOpen(false)} width={460}>
        <PayableForm onSubmit={async (data) => {
          useM13Store.setState({ error: null });
          try {
            await createPayable(data);
            const err = useM13Store.getState().error;
            if (err) onError(err); else { onSuccess('创建成功'); fetchPayables(); fetchPayableStats(); }
            setDrawerOpen(false);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>

      <FormDrawer open={paymentDrawerOpen} title="新增付款" onCancel={() => { setPaymentDrawerOpen(false); setSelectedItem(null); }} width={400}>
        {selectedItem && <PaymentForm payable={selectedItem} onSubmit={async (data) => {
          useM13Store.setState({ error: null });
          try {
            await addPayment({ ...data, payableId: selectedItem.id });
            const err = useM13Store.getState().error;
            if (err) onError(err); else { onSuccess('付款成功'); fetchPayables(); fetchPayableStats(); }
            setPaymentDrawerOpen(false); setSelectedItem(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />}
      </FormDrawer>
    </>
  );
}

function PayableForm({ onSubmit }: { onSubmit: (d: Record<string, unknown>) => Promise<void> }) {
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <Box component="input" value={supplierName} onChange={(e: any) => setSupplierName(e.target.value)}
        placeholder="供应商名称 *" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" type="number" min="0" step="0.01" value={amount} onChange={(e: any) => setAmount(e.target.value)}
        placeholder="应付金额 *" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" type="date" value={dueDate} onChange={(e: any) => setDueDate(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" value={remark} onChange={(e: any) => setRemark(e.target.value)}
        placeholder="备注" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Button variant="contained" onClick={async () => { setSubmitting(true); await onSubmit({ supplierId: '00000000-0000-0000-0000-000000000001', supplierName, amount: Number(amount), dueDate: dueDate || undefined, remark }); setSubmitting(false); }}
        disabled={submitting || !supplierName || !amount} sx={{ backgroundColor: '#005591' }}>保存</Button>
    </Box>
  );
}

function PaymentForm({ payable, onSubmit }: { payable: AccountsPayable; onSubmit: (d: Record<string, unknown>) => Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <Typography variant="body2">应付余额: {formatMoney(payable.balance)}</Typography>
      <Box component="input" type="number" min="0.01" step="0.01" value={amount} onChange={(e: any) => setAmount(e.target.value)}
        placeholder="付款金额 *" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" type="date" value={paymentDate} onChange={(e: any) => setPaymentDate(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Box component="input" value={remark} onChange={(e: any) => setRemark(e.target.value)}
        placeholder="备注" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 }} />
      <Button variant="contained" onClick={async () => { setSubmitting(true); await onSubmit({ amount: Number(amount), paymentDate, remark }); setSubmitting(false); }}
        disabled={submitting || !amount} sx={{ backgroundColor: '#005591' }}>确认付款</Button>
    </Box>
  );
}
