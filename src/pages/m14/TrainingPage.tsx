import { useEffect, useState } from 'react';
import { Button, Box, Tooltip, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM14Store } from '@/stores/useM14Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { TrainingRecord } from '@/types/m14';

const STATUS_LABELS: Record<string, string> = {
  planned: '计划中', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
};
const STATUS_COLORS: Record<string, string> = {
  planned: 'default', in_progress: 'primary', completed: 'success', cancelled: 'error',
};

const columns: Column<TrainingRecord>[] = [
  { id: 'code', label: '培训编号', sortable: true, width: 130 },
  { id: 'title', label: '培训标题', sortable: true, width: 200 },
  { id: 'trainer', label: '讲师', width: 100, render: (r) => r.trainer || '-' },
  { id: 'trainingType', label: '类型', width: 100 },
  { id: 'startDate', label: '开始日期', width: 110, render: (r) => r.startDate ? formatDate(r.startDate) : '-' },
  { id: 'participantCount', label: '参与人数', width: 90 },
  { id: 'cost', label: '费用(¥)', width: 100, render: (r) => r.cost ? `¥${r.cost.toLocaleString()}` : '-' },
  { id: 'status', label: '状态', width: 100, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} color={STATUS_COLORS[r.status] as any} />
  )},
];

export default function TrainingPage() {
  const { training, loading, error, fetchTraining, createTraining, updateTraining, removeTraining } = useM14Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingRecord | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchTraining(); }, [fetchTraining]);

  const filtered = training.filter((t) =>
    (t.code || '').includes(keyword) || (t.title || '').includes(keyword)
  );

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`确定删除培训「${title}」？`)) return;
    try {
      await removeTraining(id);
      const err = useM14Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<TrainingRecord> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        {r.status === 'planned' && (
          <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        )}
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.title)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="培训管理" subtitle={`共 ${filtered.length} 条培训记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增培训</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索编号/标题" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<TrainingRecord> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑培训' : '新增培训'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <TrainingForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM14Store.setState({ error: null });
          try {
            if (editing) { await updateTraining(editing.id, data); } else { await createTraining(data); }
            const err = useM14Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function TrainingForm({ initial, onSubmit }: { initial?: TrainingRecord; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    trainer: initial?.trainer ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    location: initial?.location ?? '',
    trainingType: initial?.trainingType ?? 'internal',
    cost: initial?.cost ?? 0,
    participantCount: initial?.participantCount ?? 0,
    remark: initial?.remark ?? '',
  });
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: field === 'cost' || field === 'participantCount' ? Number(val) : val }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <Alert severity="info" sx={{ mb: 2 }}>培训编号将自动生成</Alert>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>培训标题 *</label>
        <input value={form.title} onChange={handleChange('title')} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      </Box>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>培训类型 *</label>
        <select value={form.trainingType} onChange={handleChange('trainingType')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
          <option value="internal">内部培训</option>
          <option value="external">外部培训</option>
          <option value="online">线上培训</option>
          <option value="safety">安全培训</option>
        </select>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>讲师</label>
          <input value={form.trainer} onChange={handleChange('trainer')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>地点</label>
          <input value={form.location} onChange={handleChange('location')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>开始日期</label>
          <input type="date" value={form.startDate} onChange={handleChange('startDate')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>结束日期</label>
          <input type="date" value={form.endDate} onChange={handleChange('endDate')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>费用(¥)</label>
          <input type="number" value={form.cost} onChange={handleChange('cost')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>参与人数</label>
          <input type="number" value={form.participantCount} onChange={handleChange('participantCount')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>备注</label>
        <input value={form.remark} onChange={handleChange('remark')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={() => onSubmit(form)} sx={{ backgroundColor: '#005591' }}>提交</Button>
        <Button variant="outlined" onClick={() => setDrawerOpen(false)}>取消</Button>
      </Box>
    </div>
  );
}
