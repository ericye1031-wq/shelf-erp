import { useEffect, useState } from 'react';
import { Box, Button, Tooltip, IconButton, Alert, TextField, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM07Store } from '@/stores/useM07Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatPercent } from '@/utils/format';
import type { Project } from '@/types/m07';

const STATUS_LABELS: Record<string, string> = {
  planning: '规划中', in_progress: '进行中', paused: '已暂停', completed: '已完成', cancelled: '已取消',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  planning: 'default', in_progress: 'primary', paused: 'warning', completed: 'success', cancelled: 'error',
};

const columns: Column<Project>[] = [
  { id: 'code', label: '项目编号', sortable: true, width: 130 },
  { id: 'name', label: '名称', sortable: true },
  { id: 'customerName', label: '客户', sortable: true, width: 130,
    render: (r) => r.customerName || '-' },
  { id: 'status', label: '阶段', width: 100,
    render: (r) => (
      <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} />
    ),
  },
  { id: 'progress', label: '进度', width: 80, render: (r) => formatPercent(r.progress / 100) },
  { id: 'managerName', label: '经理', width: 80, render: (r) => r.managerName || '-' },
  { id: 'startDate', label: '开始日期', width: 110, render: (r) => r.startDate || '-' },
  { id: 'endDate', label: '结束日期', width: 110, render: (r) => r.endDate || '-' },
];

export default function ProjectListPage() {
  const { projects, loading, error, fetchProjects, createProject, updateProject, removeProject } = useM07Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) =>
    (p.code || '').includes(keyword) ||
    (p.name || '').includes(keyword) ||
    (p.customerName || '').includes(keyword)
  );

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`确定删除项目「${code}」？`)) return;
    try {
      await removeProject(id);
      const err = useM07Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  const actionColumn: Column<Project> = {
    id: 'actions',
    label: '操作',
    width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.code)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader
        title="项目管理"
        subtitle={`共 ${filtered.length} 个项目`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
            新增项目
          </Button>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索项目编号/名称/客户" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Project>
          columns={[...columns, actionColumn]}
          rows={filtered}
          rowKey="id"
          loading={loading}
          page={0}
          pageSize={20}
          total={filtered.length}
        />
      </Box>
      <FormDrawer
        open={drawerOpen}
        title={editing ? '编辑项目' : '新增项目'}
        onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        width={560}
      >
        <ProjectForm
          initial={editing ?? undefined}
          onSubmit={async (data) => {
            useM07Store.setState({ error: null });
            try {
              if (editing) {
                await updateProject(editing.id, data);
              } else {
                await createProject(data);
              }
              const err = useM07Store.getState().error;
              if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
              setDrawerOpen(false);
              setEditing(null);
            } catch (e) {
              onError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      </FormDrawer>
    </>
  );
}

/** 内嵌表单组件 */
function ProjectForm({ initial, onSubmit }: { initial?: Project; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    name: initial?.name ?? '',
    customerName: initial?.customerName ?? '',
    managerName: initial?.managerName ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    status: initial?.status ?? 'planning',
    description: initial?.description ?? '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmit({
      code: form.code,
      name: form.name,
      customerName: form.customerName || undefined,
      managerName: form.managerName || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: form.status,
      description: form.description || undefined,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="项目编号" value={form.code} onChange={handleChange('code')} size="small" required fullWidth />
        <TextField label="项目名称" value={form.name} onChange={handleChange('name')} size="small" required fullWidth />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="客户名称" value={form.customerName} onChange={handleChange('customerName')} size="small" fullWidth />
        <TextField label="项目经理" value={form.managerName} onChange={handleChange('managerName')} size="small" fullWidth />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <TextField label="开始日期" type="date" value={form.startDate} onChange={handleChange('startDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="结束日期" type="date" value={form.endDate} onChange={handleChange('endDate')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
      </div>
      <TextField label="阶段" value={form.status} onChange={handleChange('status')} size="small" select fullWidth>
        <MenuItem value="planning">规划中</MenuItem>
        <MenuItem value="in_progress">进行中</MenuItem>
        <MenuItem value="paused">已暂停</MenuItem>
        <MenuItem value="completed">已完成</MenuItem>
        <MenuItem value="cancelled">已取消</MenuItem>
      </TextField>
      <TextField label="描述" value={form.description} onChange={handleChange('description')} size="small" multiline rows={3} fullWidth />
      <div style={{ display: 'none' }} onClick={handleSubmit} />
    </div>
  );
}
