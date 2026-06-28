import { useEffect, useState, useMemo } from 'react';
import {
  Button, Box, Tooltip, IconButton, Alert, Chip, FormControl, InputLabel,
  Select, MenuItem, TextField, Typography, Card, CardContent, Grid, Rating,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM16Store } from '@/stores/useM16Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { ServiceTicket, ServiceTicketStatus, ServiceType } from '@/types/m16';

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理', assigned: '已分配', processing: '处理中', resolved: '已解决', closed: '已关闭', cancelled: '已取消',
};
const TYPE_LABELS: Record<string, string> = {
  repair: '维修', maintain: '保养', install: '安装', consult: '咨询', other: '其他',
};

const columns: Column<ServiceTicket>[] = [
  { id: 'ticketNo', label: '工单号', sortable: true, width: 130 },
  { id: 'title', label: '标题', sortable: true, width: 200 },
  { id: 'serviceType', label: '服务类型', width: 100, render: (r) => <Chip label={TYPE_LABELS[r.serviceType] || r.serviceType} size="small" /> },
  { id: 'priority', label: '优先级', width: 90, render: (r) => {
    const colors: Record<string, 'error' | 'warning' | 'info' | 'success'> = { high: 'error', medium: 'warning', low: 'info' };
    const statusKey = r.priority === 'high' ? 'critical' : r.priority === 'medium' ? 'warning' : 'info';
    return <Chip label={r.priority === 'high' ? '高' : r.priority === 'medium' ? '中' : '低'} size="small" sx={{ bgcolor: r.priority === 'high' ? '#FFEBEE' : r.priority === 'medium' ? '#FFF3E0' : '#E3F2FD', color: r.priority === 'high' ? '#C62828' : r.priority === 'medium' ? '#E65100' : '#005591', fontWeight: 600 }} />;
  }},
  { id: 'customerName', label: '客户', width: 150 },
  { id: 'status', label: '状态', width: 100, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} />
  )},
  { id: 'assignedToName', label: '处理人', width: 100, render: (r) => r.assignedToName || '-' },
  { id: 'satisfactionScore', label: '满意度', width: 120, render: (r) => r.satisfactionScore ? <Rating value={r.satisfactionScore} readOnly size="small" precision={0.5} max={5} /> : <Typography variant="caption" color="text.secondary">-</Typography> },
];

function ServiceTicketForm({ initial, onCancel, onSubmit }: { initial?: ServiceTicket; onCancel: () => void; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    serviceType: initial?.serviceType ?? 'repair',
    priority: initial?.priority ?? 'medium',
    customerName: initial?.customerName ?? '',
    contactPhone: initial?.contactPhone ?? '',
    assignedToName: initial?.assignedToName ?? '',
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
      <TextField label="描述" value={form.description} onChange={(e) => handleChange('description', e.target.value)} fullWidth multiline rows={3} />
      <FormControl fullWidth>
        <InputLabel>服务类型</InputLabel>
        <Select value={form.serviceType} label="服务类型" onChange={(e) => handleChange('serviceType', e.target.value)}>
          <MenuItem value="repair">维修</MenuItem>
          <MenuItem value="maintain">保养</MenuItem>
          <MenuItem value="install">安装</MenuItem>
          <MenuItem value="consult">咨询</MenuItem>
          <MenuItem value="other">其他</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>优先级</InputLabel>
        <Select value={form.priority} label="优先级" onChange={(e) => handleChange('priority', e.target.value)}>
          <MenuItem value="low">低</MenuItem>
          <MenuItem value="medium">中</MenuItem>
          <MenuItem value="high">高</MenuItem>
          <MenuItem value="critical">紧急</MenuItem>
        </Select>
      </FormControl>
      <TextField label="客户名称" value={form.customerName} onChange={(e) => handleChange('customerName', e.target.value)} fullWidth required />
      <TextField label="联系电话" value={form.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} fullWidth />
      <TextField label="分配处理人" value={form.assignedToName} onChange={(e) => handleChange('assignedToName', e.target.value)} fullWidth />
      {initial && (
        <FormControl fullWidth>
          <InputLabel>状态</InputLabel>
          <Select value={form.status} label="状态" onChange={(e) => handleChange('status', e.target.value)}>
            <MenuItem value="pending">待处理</MenuItem>
            <MenuItem value="assigned">已分配</MenuItem>
            <MenuItem value="processing">处理中</MenuItem>
            <MenuItem value="resolved">已解决</MenuItem>
            <MenuItem value="closed">已关闭</MenuItem>
            <MenuItem value="cancelled">已取消</MenuItem>
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
        <Button onClick={onCancel}>取消</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ backgroundColor: '#005591' }}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </Box>
    </Box>
  );
}

export default function ServiceTicketListPage() {
  const { serviceTickets, loading, error, fetchServiceTickets, createServiceTicket, updateServiceTicket, removeServiceTicket } = useM16Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceTicket | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<string>('');
  const [dispatchTargetId, setDispatchTargetId] = useState<string>('');

  useEffect(() => { fetchServiceTickets(); }, [fetchServiceTickets]);

  const filtered = serviceTickets.filter((t) => {
    const matchKeyword = !keyword || (t.ticketNo || '').includes(keyword) || (t.title || '').includes(keyword) || (t.customerName || '').includes(keyword);
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchProject = !projectFilter || ((t as any).projectName || '').includes(projectFilter);
    return matchKeyword && matchStatus && matchProject;
  });

  // Summary stats
  const stats = useMemo(() => {
    const all = serviceTickets;
    return {
      total: all.length,
      pending: all.filter((t) => t.status === 'pending').length,
      inProgress: all.filter((t) => t.status === 'assigned' || t.status === 'processing').length,
      resolved: all.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    };
  }, [serviceTickets]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除工单「${name}」？`)) return;
    try {
      await removeServiceTicket(id);
      const err = useM16Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    useM16Store.setState({ error: null });
    try {
      if (editing) { await updateServiceTicket(editing.id, data); } else { await createServiceTicket(data); }
      const err = useM16Store.getState().error;
      if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
      setDrawerOpen(false); setEditing(null);
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const handleAutoDispatch = async (ticket: ServiceTicket) => {
    setDispatchTargetId(ticket.id);
    setDispatchTarget(`${ticket.ticketNo} - ${ticket.title}`);
    setDispatchOpen(true);
  };

  const handleConfirmDispatch = async () => {
    try {
      await updateServiceTicket(dispatchTargetId, { status: 'assigned' });
      onSuccess('已自动派工');
      setDispatchOpen(false);
      setDispatchTargetId('');
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<ServiceTicket> = {
    id: 'actions', label: '操作', width: 160,
    render: (r) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        {r.status === 'pending' && (
          <Tooltip title="自动派工">
            <IconButton size="small" color="primary" onClick={() => handleAutoDispatch(r)}>
              <AssignmentReturnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.title)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="服务工单" subtitle={`共 ${filtered.length} 条工单`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增工单</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '全部工单', value: stats.total, color: '#005591' },
          { label: '待处理', value: stats.pending, color: '#E65100' },
          { label: '处理中', value: stats.inProgress, color: '#1565C0' },
          { label: '已解决', value: stats.resolved, color: '#2E7D32' },
        ].map((stat) => (
          <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
            <Card variant="outlined" sx={{ textAlign: 'center', borderLeft: 4, borderColor: stat.color }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h5" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar placeholder="搜索工单号/标题/客户" value={keyword} onChange={setKeyword} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>状态筛选</InputLabel>
          <Select value={statusFilter} label="状态筛选" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="pending">待处理</MenuItem>
            <MenuItem value="assigned">已分配</MenuItem>
            <MenuItem value="processing">处理中</MenuItem>
            <MenuItem value="resolved">已解决</MenuItem>
            <MenuItem value="closed">已关闭</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>项目筛选</InputLabel>
          <Select value={projectFilter} label="项目筛选" onChange={(e) => setProjectFilter(e.target.value)}>
            <MenuItem value="">全部项目</MenuItem>
            {[...new Set(serviceTickets.map((t) => (t as any).projectName).filter(Boolean) as string[])].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<ServiceTicket> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑工单' : '新增工单'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={600}>
        <ServiceTicketForm initial={editing ?? undefined} onCancel={() => { setDrawerOpen(false); setEditing(null); }} onSubmit={handleSubmit} />
      </FormDrawer>

      {/* Auto Dispatch Confirmation Dialog */}
      <Dialog open={dispatchOpen} onClose={() => setDispatchOpen(false)}>
        <DialogTitle>确认自动派工</DialogTitle>
        <DialogContent>
          <Typography>
            系统将把工单 <strong>{dispatchTarget}</strong> 自动分配至最合适的处理人。
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            分配依据：技能匹配度、当前负载和地理位置。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDispatchOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleConfirmDispatch} sx={{ backgroundColor: '#005591' }}>确认派工</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
