import { useEffect, useState } from 'react';
import { Button, Chip, Box, Tooltip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM13Store } from '@/stores/useM13Store';
import { formatDate, formatMoney } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import type { Voucher } from '@/types/m13';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', audited: '已审核',
  posted: '已过账', cancelled: '已取消',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default', submitted: 'primary', audited: 'info',
  posted: 'success', cancelled: 'error',
};

const columns: Column<Voucher>[] = [
  { id: 'voucherNo', label: '凭证号', sortable: true, width: 150 },
  { id: 'voucherDate', label: '凭证日期', sortable: true, width: 110,
    render: (r) => formatDate(r.voucherDate) },
  { id: 'totalDebit', label: '借方合计', align: 'right', width: 120,
    render: (r) => formatMoney(r.totalDebit) },
  { id: 'totalCredit', label: '贷方合计', align: 'right', width: 120,
    render: (r) => formatMoney(r.totalCredit) },
  { id: 'status', label: '状态', width: 90,
    render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status] || r.status} /> },
  { id: 'remark', label: '摘要', render: (r) => r.remark || '-' },
];

export default function VoucherListPage() {
  const navigate = useNavigate();
  const { vouchers, loading, error, fetchVouchers, removeVoucher, postVoucher } = useM13Store();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const filtered = vouchers.filter((v) =>
    ((v.voucherNo || '').includes(keyword) || (v.remark || '').includes(keyword)) &&
    (!statusFilter || v.status === statusFilter)
  );

  const handleDelete = async (id: string, no: string) => {
    if (!window.confirm(`确定删除凭证「${no}」？`)) return;
    try {
      await removeVoucher(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const actionColumn: Column<Voucher> = {
    id: 'actions', label: '操作', width: 200,
    render: (r) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => navigate(`/m13/vouchers/new?id=${r.id}`)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {r.status === 'audited' && (
          <Tooltip title="过账">
            <IconButton size="small" color="success" onClick={() => postVoucher(r.id).then(() => fetchVouchers())}>
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.voucherNo)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="凭证管理" subtitle={`共 ${filtered.length} 张凭证`}
        action={
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate('/m13/vouchers/new')} sx={{ backgroundColor: '#005591' }}>
            录入凭证
          </Button>} />
      {error && <Box sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderRadius: 1, color: 'error.main' }}>错误：{error}</Box>}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <SearchBar placeholder="搜索凭证号/摘要" value={keyword} onChange={setKeyword} />
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {['', 'draft', 'submitted', 'audited', 'posted', 'cancelled'].map((s) => (
            <Chip key={s || 'all'} label={s ? STATUS_LABELS[s] : '全部'}
              color={statusFilter === s ? 'primary' : 'default'}
              variant={statusFilter === s ? 'filled' : 'outlined'}
              size="small" onClick={() => setStatusFilter(s)} sx={{ cursor: 'pointer' }} />
          ))}
        </Box>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Voucher> columns={[...columns, actionColumn]} rows={filtered}
          rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
    </>
  );
}
