import { useEffect, useState } from 'react';
import { Button, Box, Alert, TextField, MenuItem, Chip, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { InstallIssue, IssueSeverity } from '@/types/m15';

const SEVERITY_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'default',
};
const SEVERITY_LABELS: Record<string, string> = {
  critical: '严重', high: '高', medium: '中', low: '低',
};
const ISSUE_TYPE_OPTIONS = ['缺件', '损坏', '设计变更', '客户追加需求', '其他'];
const ISSUE_STATUS_LABELS: Record<string, string> = {
  open: '待处理', in_progress: '处理中', resolved: '已解决',
};
const ISSUE_STATUS_COLORS: Record<string, string> = {
  open: 'error', in_progress: 'warning', resolved: 'success',
};

const columns: Column<InstallIssue>[] = [
  { id: 'issueType', label: '类型', width: 120,
    render: (r) => <Chip label={r.issueType} size="small" variant="outlined" /> },
  { id: 'severity', label: '严重程度', width: 100,
    render: (r) => <Chip label={SEVERITY_LABELS[r.severity]} size="small" color={SEVERITY_COLORS[r.severity]} /> },
  { id: 'description', label: '描述', width: 250,
    render: (r) => r.description },
  { id: 'status', label: '状态', width: 100,
    render: (r) => <StatusBadge status={r.status} label={ISSUE_STATUS_LABELS[r.status]} color={ISSUE_STATUS_COLORS[r.status] as any} /> },
  { id: 'createdAt', label: '上报时间', width: 120,
    render: (r) => formatDate(r.createdAt) },
];

export default function InstallIssuePage() {
  const { plans, fetchPlans, issues, loading, error, fetchIssues, createIssue, updateIssue, removeIssue } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<InstallIssue | null>(null);

  useEffect(() => { fetchPlans(); fetchIssues(); }, []);

  const actionColumn: Column<InstallIssue> = {
    id: 'actions', label: '操作', width: 140,
    render: (r) => (
      <Box>
        {r.status !== 'resolved' && (
          <Tooltip title="更新状态">
            <IconButton size="small" onClick={async () => {
              const next = r.status === 'open' ? 'in_progress' : 'resolved';
              try { await updateIssue(r.id, { status: next }); onSuccess('状态更新成功'); } catch (e) { onError(e); }
            }}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
        )}
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={async () => {
            if (!window.confirm('确定删除该问题？')) return;
            try { await removeIssue(r.id); onSuccess('删除成功'); } catch (e) { onError(e); }
          }}><DeleteIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="现场问题" subtitle={`共 ${issues.length} 个问题`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>上报问题</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<InstallIssue> columns={[...columns, actionColumn]} rows={issues} rowKey="id" loading={loading} page={0} pageSize={50} total={issues.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑问题' : '上报问题'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <IssueForm
          initial={editing ?? undefined}
          plans={plans}
          onSubmit={async (data) => {
            useM15Store.setState({ error: null });
            try {
              if (editing) { await updateIssue(editing.id, data); } else { await createIssue(data); }
              const err = useM15Store.getState().error;
              if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '上报成功'); }
              setDrawerOpen(false); setEditing(null);
            } catch (e) { onError(e); }
          }}
        />
      </FormDrawer>
    </>
  );
}

function IssueForm({ initial, plans, onSubmit }: { initial?: InstallIssue; plans: any[]; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    planId: initial?.planId ?? '', issueType: initial?.issueType ?? '缺件',
    severity: initial?.severity ?? 'medium' as IssueSeverity, description: initial?.description ?? '',
    solution: initial?.solution ?? '',
  });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <TextField label="安装计划" value={form.planId} onChange={handleChange('planId')} size="small" select required disabled={!!initial}>
        {plans.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.code} - {p.siteAddress}</MenuItem>)}
      </TextField>
      <TextField label="问题类型" value={form.issueType} onChange={handleChange('issueType')} size="small" select required>
        {ISSUE_TYPE_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      <TextField label="严重程度" value={form.severity} onChange={handleChange('severity')} size="small" select required>
        <MenuItem value="low">低</MenuItem><MenuItem value="medium">中</MenuItem><MenuItem value="high">高</MenuItem><MenuItem value="critical">严重</MenuItem>
      </TextField>
      <TextField label="问题描述" value={form.description} onChange={handleChange('description')} size="small" required multiline rows={3} />
      <TextField label="解决方案" value={form.solution} onChange={handleChange('solution')} size="small" multiline rows={2} />
      <Button variant="contained" onClick={() => onSubmit(form)} sx={{ backgroundColor: '#005591' }}>
        {initial ? '保存' : '上报'}
      </Button>
    </div>
  );
}
