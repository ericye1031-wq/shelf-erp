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
import type { PerformanceReview } from '@/types/m14';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', reviewed: '已评审', confirmed: '已确认',
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'default', submitted: 'info', reviewed: 'warning', confirmed: 'success',
};
const PERIOD_LABELS: Record<string, string> = {
  monthly: '月度', quarterly: '季度', annual: '年度',
};

const columns: Column<PerformanceReview>[] = [
  { id: 'employeeName', label: '员工', sortable: true, width: 100 },
  { id: 'reviewPeriod', label: '考核类型', width: 90, render: (r) => PERIOD_LABELS[r.reviewPeriod] },
  { id: 'periodLabel', label: '考核周期', sortable: true, width: 110 },
  { id: 'kpiScore', label: 'KPI', width: 80, render: (r) => r.kpiScore ?? '-' },
  { id: 'attitudeScore', label: '态度', width: 80, render: (r) => r.attitudeScore ?? '-' },
  { id: 'skillScore', label: '技能', width: 80, render: (r) => r.skillScore ?? '-' },
  { id: 'totalScore', label: '总分', width: 80, render: (r) => r.totalScore?.toFixed(1) ?? '-' },
  { id: 'status', label: '状态', width: 90, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} color={STATUS_COLORS[r.status] as any} />
  )},
];

export default function PerformancePage() {
  const { performance, employees, loading, error, fetchPerformance, fetchEmployees, createPerformance, updatePerformance, removePerformance } = useM14Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PerformanceReview | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchPerformance(); fetchEmployees(); }, [fetchPerformance, fetchEmployees]);

  const filtered = performance.filter((p) =>
    (p.employeeName || '').includes(keyword) || (p.periodLabel || '').includes(keyword)
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此绩效记录？')) return;
    try {
      await removePerformance(id);
      const err = useM14Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<PerformanceReview> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        {r.status === 'draft' && (
          <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        )}
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="绩效评估" subtitle={`共 ${filtered.length} 条绩效记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增绩效</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索员工/周期" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<PerformanceReview> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑绩效' : '新增绩效'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <PerformanceForm initial={editing ?? undefined} employees={employees} onSubmit={async (data) => {
          useM14Store.setState({ error: null });
          try {
            if (editing) { await updatePerformance(editing.id, data); } else { await createPerformance(data); }
            const err = useM14Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function PerformanceForm({ initial, employees, onSubmit }: { initial?: PerformanceReview; employees: any[]; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    employeeId: initial?.employeeId ?? '',
    employeeName: initial?.employeeName ?? '',
    reviewPeriod: initial?.reviewPeriod ?? 'monthly',
    periodLabel: initial?.periodLabel ?? '2026-06',
    reviewerName: initial?.reviewerName ?? '',
    kpiScore: initial?.kpiScore ?? '',
    attitudeScore: initial?.attitudeScore ?? '',
    skillScore: initial?.skillScore ?? '',
    remark: initial?.remark ?? '',
  });
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === 'employeeId') {
      const emp = employees.find((e: any) => e.id === val);
      if (emp) setForm((prev) => ({ ...prev, employeeName: emp.name }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>员工 *</label>
        <select value={form.employeeId} onChange={handleChange('employeeId')} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
          <option value="">请选择员工</option>
          {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
        </select>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>考核类型 *</label>
          <select value={form.reviewPeriod} onChange={handleChange('reviewPeriod')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
            <option value="monthly">月度</option>
            <option value="quarterly">季度</option>
            <option value="annual">年度</option>
          </select>
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>周期标签 *</label>
          <input value={form.periodLabel} onChange={handleChange('periodLabel')} placeholder="如 2026-Q2" required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>考核人</label>
        <input value={form.reviewerName} onChange={handleChange('reviewerName')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>KPI得分(0-100)</label>
          <input type="number" min="0" max="100" value={form.kpiScore} onChange={handleChange('kpiScore')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>态度得分(0-100)</label>
          <input type="number" min="0" max="100" value={form.attitudeScore} onChange={handleChange('attitudeScore')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>技能得分(0-100)</label>
          <input type="number" min="0" max="100" value={form.skillScore} onChange={handleChange('skillScore')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>备注</label>
        <input value={form.remark} onChange={handleChange('remark')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={() => {
          const data = { ...form };
          if (data.kpiScore) data.kpiScore = Number(data.kpiScore);
          if (data.attitudeScore) data.attitudeScore = Number(data.attitudeScore);
          if (data.skillScore) data.skillScore = Number(data.skillScore);
          onSubmit(data);
        }} sx={{ backgroundColor: '#005591' }}>提交</Button>
        <Button variant="outlined" onClick={() => setDrawerOpen(false)}>取消</Button>
      </Box>
    </div>
  );
}
