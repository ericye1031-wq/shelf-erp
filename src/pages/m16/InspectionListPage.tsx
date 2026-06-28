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
import type { Inspection, InspectionStatus, InspectionResult } from '@/types/m16';

const STATUS_LABELS: Record<string, string> = {
  pending: '待巡检', processing: '巡检中', completed: '已完成', exception: '有异常',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'warning', processing: 'info', completed: 'success', exception: 'error',
};
const RESULT_LABELS: Record<string, string> = {
  pass: '通过', fail: '未通过', pending: '待判定',
};

const columns: Column<Inspection>[] = [
  { id: 'inspectionNo', label: '巡检单号', sortable: true, width: 130 },
  { id: 'title', label: '标题', width: 200 },
  { id: 'equipmentName', label: '设备名称', width: 150 },
  { id: 'inspectorName', label: '巡检人', width: 100, render: (r) => r.inspectorName || '-' },
  { id: 'result', label: '结果', width: 100, render: (r) => <Chip label={RESULT_LABELS[r.result]} color={r.result === 'pass' ? 'success' : r.result === 'fail' ? 'error' : 'warning'} size="small" /> },
  { id: 'status', label: '状态', width: 100, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} />
  )},
];

export default function InspectionListPage() {
  const { inspections, loading, error, fetchInspections, createInspection, updateInspection, removeInspection } = useM16Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchInspections(); }, [fetchInspections]);

  const filtered = inspections.filter((r) =>
    (r.inspectionNo || '').includes(keyword) || (r.title || '').includes(keyword) || (r.equipmentName || '').includes(keyword)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除巡检记录「${name}」？`)) return;
    try {
      await removeInspection(id);
      const err = useM16Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<Inspection> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.inspectionNo)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="巡检管理" subtitle={`共 ${filtered.length} 条记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增巡检</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索巡检单号/标题/设备名称" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Inspection> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑巡检' : '新增巡检'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={600}>
        <InspectionForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM16Store.setState({ error: null });
          try {
            if (editing) { await updateInspection(editing.id, data); } else { await createInspection(data); }
            const err = useM16Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function InspectionForm({ initial, onSubmit }: { initial?: Inspection; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    equipmentName: initial?.equipmentName ?? '',
    inspectorName: initial?.inspectorName ?? '',
    result: initial?.result ?? 'pending',
    issueDesc: initial?.issueDesc ?? '',
    status: initial?.status ?? 'pending',
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
      <TextField label="标题" value={form.title} onChange={(e) => handleChange('title', e.target.value)} fullWidth required />
      <TextField label="设备名称" value={form.equipmentName} onChange={(e) => handleChange('equipmentName', e.target.value)} fullWidth />
      <TextField label="巡检人" value={form.inspectorName} onChange={(e) => handleChange('inspectorName', e.target.value)} fullWidth />
      <FormControl fullWidth>
        <InputLabel>结果</InputLabel>
        <Select value={form.result} label="结果" onChange={(e) => handleChange('result', e.target.value)}>
          <MenuItem value="pending">待判定</MenuItem>
          <MenuItem value="pass">通过</MenuItem>
          <MenuItem value="fail">未通过</MenuItem>
        </Select>
      </FormControl>
      <TextField label="问题描述" value={form.issueDesc} onChange={(e) => handleChange('issueDesc', e.target.value)} fullWidth multiline rows={2} />
      {initial && (
        <FormControl fullWidth>
          <InputLabel>状态</InputLabel>
          <Select value={form.status} label="状态" onChange={(e) => handleChange('status', e.target.value)}>
            <MenuItem value="pending">待巡检</MenuItem>
            <MenuItem value="processing">巡检中</MenuItem>
            <MenuItem value="completed">已完成</MenuItem>
            <MenuItem value="exception">有异常</MenuItem>
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
