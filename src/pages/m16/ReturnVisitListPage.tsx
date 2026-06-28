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
import type { ReturnVisit, ReturnVisitStatus, VisitMethod } from '@/types/m16';

const STATUS_LABELS: Record<string, string> = {
  pending: '待回访', completed: '已完成', unreachable: '无法联系', refused: '拒绝回访',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'warning', completed: 'success', unreachable: 'error', refused: 'default',
};
const METHOD_LABELS: Record<string, string> = {
  phone: '电话', onsite: '上门', online: '在线',
};

const columns: Column<ReturnVisit>[] = [
  { id: 'visitNo', label: '回访单号', sortable: true, width: 130 },
  { id: 'customerName', label: '客户名称', width: 150 },
  { id: 'visitMethod', label: '回访方式', width: 100, render: (r) => METHOD_LABELS[r.visitMethod] || r.visitMethod },
  { id: 'satisfactionScore', label: '满意度', width: 100, render: (r) => r.satisfactionScore ? `${r.satisfactionScore}分` : '-' },
  { id: 'visitedByName', label: '回访人', width: 100, render: (r) => r.visitedByName || '-' },
  { id: 'status', label: '状态', width: 100, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} />
  )},
];

export default function ReturnVisitListPage() {
  const { returnVisits, loading, error, fetchReturnVisits, createReturnVisit, updateReturnVisit, removeReturnVisit } = useM16Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ReturnVisit | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchReturnVisits(); }, [fetchReturnVisits]);

  const filtered = returnVisits.filter((r) =>
    (r.visitNo || '').includes(keyword) || (r.customerName || '').includes(keyword)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除回访记录「${name}」？`)) return;
    try {
      await removeReturnVisit(id);
      const err = useM16Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<ReturnVisit> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.visitNo)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="客户回访" subtitle={`共 ${filtered.length} 条记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增回访</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索回访单号/客户名称" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<ReturnVisit> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑回访' : '新增回访'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={600}>
        <ReturnVisitForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM16Store.setState({ error: null });
          try {
            if (editing) { await updateReturnVisit(editing.id, data); } else { await createReturnVisit(data); }
            const err = useM16Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function ReturnVisitForm({ initial, onSubmit }: { initial?: ReturnVisit; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    customerName: initial?.customerName ?? '',
    visitMethod: initial?.visitMethod ?? 'phone',
    satisfactionScore: initial?.satisfactionScore ?? 5,
    feedback: initial?.feedback ?? '',
    status: initial?.status ?? 'pending',
    visitedByName: initial?.visitedByName ?? '',
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
      <TextField label="客户名称" value={form.customerName} onChange={(e) => handleChange('customerName', e.target.value)} fullWidth required />
      <FormControl fullWidth>
        <InputLabel>回访方式</InputLabel>
        <Select value={form.visitMethod} label="回访方式" onChange={(e) => handleChange('visitMethod', e.target.value)}>
          <MenuItem value="phone">电话</MenuItem>
          <MenuItem value="onsite">上门</MenuItem>
          <MenuItem value="online">在线</MenuItem>
        </Select>
      </FormControl>
      <TextField label="满意度评分(1-5)" value={form.satisfactionScore} onChange={(e) => handleChange('satisfactionScore', parseInt(e.target.value) || 5)} fullWidth type="number" inputProps={{ min: 1, max: 5 }} />
      <TextField label="回访反馈" value={form.feedback} onChange={(e) => handleChange('feedback', e.target.value)} fullWidth multiline rows={3} />
      <TextField label="回访人" value={form.visitedByName} onChange={(e) => handleChange('visitedByName', e.target.value)} fullWidth />
      {initial && (
        <FormControl fullWidth>
          <InputLabel>状态</InputLabel>
          <Select value={form.status} label="状态" onChange={(e) => handleChange('status', e.target.value)}>
            <MenuItem value="pending">待回访</MenuItem>
            <MenuItem value="completed">已完成</MenuItem>
            <MenuItem value="unreachable">无法联系</MenuItem>
            <MenuItem value="refused">拒绝回访</MenuItem>
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
