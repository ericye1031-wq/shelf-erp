import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Tooltip, IconButton, Alert, TextField, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { InstallPlan } from '@/types/m15';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', in_progress: '安装中', completed: '已完成', cancelled: '已取消',
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'default', submitted: 'info', in_progress: 'primary', completed: 'success', cancelled: 'error',
};
const STATUS_OPTIONS = ['draft', 'submitted', 'in_progress', 'completed', 'cancelled'];

const columns: Column<InstallPlan>[] = [
  { id: 'code', label: '计划编号', sortable: true, width: 130 },
  { id: 'siteAddress', label: '安装地址', sortable: true, width: 200,
    render: (r) => r.siteAddress || '-' },
  { id: 'startDate', label: '开始日期', sortable: true, width: 110,
    render: (r) => r.startDate ? formatDate(r.startDate) : '-' },
  { id: 'endDate', label: '结束日期', sortable: true, width: 110,
    render: (r) => r.endDate ? formatDate(r.endDate) : '-' },
  { id: 'status', label: '状态', width: 100,
    render: (r) => (
      <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} color={STATUS_COLORS[r.status] as any} />
    ),
  },
];

export default function InstallPlanListPage() {
  const nav = useNavigate();
  const { plans, loading, error, fetchPlans, createPlan, updatePlan, removePlan } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InstallPlan | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const filtered = plans.filter((p) =>
    (p.code || '').includes(keyword) || (p.siteAddress || '').includes(keyword)
  );

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`确定删除安装计划「${code}」？`)) return;
    try {
      await removePlan(id);
      const err = useM15Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  const actionColumn: Column<InstallPlan> = {
    id: 'actions', label: '操作', width: 140,
    render: (r) => (
      <Box>
        <Tooltip title="查看详情"><IconButton size="small" onClick={() => nav(`/m15/plans/${r.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.code)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="安装管理" subtitle={`共 ${filtered.length} 个安装计划`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
            新增安装计划
          </Button>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索计划编号/安装地址" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<InstallPlan> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑安装计划' : '新增安装计划'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <PlanForm
          initial={editing ?? undefined}
          onSubmit={async (data) => {
            useM15Store.setState({ error: null });
            try {
              if (editing) { await updatePlan(editing.id, data); } else { await createPlan(data); }
              const err = useM15Store.getState().error;
              if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
              setDrawerOpen(false); setEditing(null);
            } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
          }}
        />
      </FormDrawer>
    </>
  );
}

function PlanForm({ initial, onSubmit }: { initial?: InstallPlan; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    siteAddress: initial?.siteAddress ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    safetyBriefing: initial?.safetyBriefing ?? '',
  });
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <TextField label="安装地址" value={form.siteAddress} onChange={handleChange('siteAddress')} size="small" required fullWidth multiline rows={2} />
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="开始日期" type="date" value={form.startDate} onChange={handleChange('startDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="结束日期" type="date" value={form.endDate} onChange={handleChange('endDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
      </div>
      <TextField label="安全交底" value={form.safetyBriefing} onChange={handleChange('safetyBriefing')} size="small" fullWidth multiline rows={4} />
      <Button variant="contained" onClick={() => onSubmit(form)} sx={{ backgroundColor: '#005591' }}>
        {initial ? '保存' : '创建'}
      </Button>
    </div>
  );
}
