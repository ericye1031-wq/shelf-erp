import { useEffect, useState } from 'react';
import { Button, Box, Tooltip, IconButton, Alert, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM16Store } from '@/stores/useM16Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Warranty, WarrantyStatus, WarrantyType } from '@/types/m16';

const STATUS_LABELS: Record<string, string> = {
  active: '有效', expiring: '即将到期', expired: '已过期', void: '已作废',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'success', expiring: 'warning', expired: 'error', void: 'default',
};
const TYPE_LABELS: Record<string, string> = {
  full: '整机', parts: '部件', labor: '人工',
};

const columns: Column<Warranty>[] = [
  { id: 'warrantyNo', label: '质保单号', sortable: true, width: 130 },
  { id: 'productName', label: '产品名称', width: 200 },
  { id: 'customerName', label: '客户名称', width: 150 },
  { id: 'startDate', label: '开始日期', width: 110 },
  { id: 'endDate', label: '结束日期', width: 110 },
  { id: 'warrantyType', label: '质保类型', width: 100, render: (r) => TYPE_LABELS[r.warrantyType] || r.warrantyType },
  { id: 'status', label: '状态', width: 100, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} />
  )},
];

export default function WarrantyListPage() {
  const { warranties, loading, error, fetchWarranties, createWarranty, updateWarranty, removeWarranty } = useM16Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Warranty | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchWarranties(); }, [fetchWarranties]);

  const filtered = warranties.filter((r) =>
    (r.warrantyNo || '').includes(keyword) || (r.productName || '').includes(keyword) || (r.customerName || '').includes(keyword)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除质保记录「${name}」？`)) return;
    try {
      await removeWarranty(id);
      const err = useM16Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<Warranty> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.warrantyNo)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="质保管理" subtitle={`共 ${filtered.length} 条记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增质保</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索质保单号/产品名称/客户" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Warranty> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑质保' : '新增质保'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={600}>
        <WarrantyForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM16Store.setState({ error: null });
          try {
            if (editing) { await updateWarranty(editing.id, data); } else { await createWarranty(data); }
            const err = useM16Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function WarrantyForm({ initial, onSubmit }: { initial?: Warranty; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    productName: initial?.productName ?? '',
    customerName: initial?.customerName ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    warrantyType: initial?.warrantyType ?? 'full',
    status: initial?.status ?? 'active',
    description: initial?.description ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField label="产品名称" value={form.productName} onChange={(e) => handleChange('productName', e.target.value)} fullWidth required />
      <TextField label="客户名称" value={form.customerName} onChange={(e) => handleChange('customerName', e.target.value)} fullWidth required />
      <TextField label="开始日期" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} fullWidth type="date" InputLabelProps={{ shrink: true }} />
      <TextField label="结束日期" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} fullWidth type="date" InputLabelProps={{ shrink: true }} />
      <FormControl fullWidth>
        <InputLabel>质保类型</InputLabel>
        <Select value={form.warrantyType} label="质保类型" onChange={(e) => handleChange('warrantyType', e.target.value)}>
          <MenuItem value="full">整机</MenuItem>
          <MenuItem value="parts">部件</MenuItem>
          <MenuItem value="labor">人工</MenuItem>
        </Select>
      </FormControl>
      <TextField label="描述" value={form.description} onChange={(e) => handleChange('description', e.target.value)} fullWidth multiline rows={2} />
      {initial && (
        <FormControl fullWidth>
          <InputLabel>状态</InputLabel>
          <Select value={form.status} label="状态" onChange={(e) => handleChange('status', e.target.value)}>
            <MenuItem value="active">有效</MenuItem>
            <MenuItem value="expiring">即将到期</MenuItem>
            <MenuItem value="expired">已过期</MenuItem>
            <MenuItem value="void">已作废</MenuItem>
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
        <Button onClick={() => { setDrawerOpen(false); setEditing(null); }}>取消</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ backgroundColor: '#005591' }}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </Box>
    </Box>
  );
}

import { TextField } from '@mui/material';
