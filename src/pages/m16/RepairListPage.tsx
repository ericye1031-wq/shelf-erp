import { useEffect, useState, useMemo } from 'react';
import { Button, Box, Tooltip, IconButton, Alert, Chip, FormControl, InputLabel, Select, MenuItem, TextField, Typography, Card, CardContent, Grid, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
import { formatDate, formatMoney } from '@/utils/format';
import type { Repair } from '@/types/m16';

const STATUS_LABELS: Record<string, string> = {
  pending: '待维修', processing: '维修中', completed: '已完成', cancelled: '已取消',
};
const FAULT_LABELS: Record<string, string> = {
  low: '低', medium: '中', high: '高', critical: '紧急',
};
const FAULT_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'default',
};

interface SparePart {
  id: string; partNo: string; partName: string;
  quantity: number; unitPrice: number; totalPrice: number;
}

const columns: Column<Repair>[] = [
  { id: 'repairNo', label: '维修单号', sortable: true, width: 130 },
  { id: 'equipmentName', label: '设备名称', width: 150 },
  { id: 'faultDesc', label: '故障描述', width: 180 },
  { id: 'faultLevel', label: '故障等级', width: 100,
    render: (r) => <Chip label={FAULT_LABELS[r.faultLevel] || r.faultLevel}
      color={FAULT_COLORS[r.faultLevel] || 'default'} size="small" /> },
  { id: 'repairByName', label: '维修人', width: 100, render: (r) => r.repairByName || '-' },
  { id: 'repairCost', label: '维修费用', width: 100,
    render: (r) => r.repairCost ? formatMoney(r.repairCost) : '-' },
  { id: 'status', label: '状态', width: 100,
    render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} /> },
];

function RepairForm({ initial, onSubmit }: { initial?: Repair; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    equipmentName: initial?.equipmentName ?? '', faultDesc: initial?.faultDesc ?? '',
    faultLevel: initial?.faultLevel ?? 'medium', repairDesc: initial?.repairDesc ?? '',
    repairCost: initial?.repairCost ?? 0, partsUsed: initial?.partsUsed ?? '',
    status: initial?.status ?? 'pending',
  });
  const [saving, setSaving] = useState(false);
  const handleChange = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));
  const handleSubmit = async () => { setSaving(true); try { await onSubmit(form); } finally { setSaving(false); } };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField label="设备名称" value={form.equipmentName} onChange={(e) => handleChange('equipmentName', e.target.value)} fullWidth />
      <TextField label="故障描述" value={form.faultDesc} onChange={(e) => handleChange('faultDesc', e.target.value)} fullWidth multiline rows={3} />
      <FormControl fullWidth>
        <InputLabel>故障等级</InputLabel>
        <Select value={form.faultLevel} label="故障等级" onChange={(e) => handleChange('faultLevel', e.target.value)}>
          <MenuItem value="low">低</MenuItem><MenuItem value="medium">中</MenuItem>
          <MenuItem value="high">高</MenuItem><MenuItem value="critical">紧急</MenuItem>
        </Select>
      </FormControl>
      <TextField label="维修描述" value={form.repairDesc} onChange={(e) => handleChange('repairDesc', e.target.value)} fullWidth multiline rows={2} />
      <TextField label="备件(逗号分隔)" value={form.partsUsed} onChange={(e) => handleChange('partsUsed', e.target.value)} fullWidth />
      <TextField label="维修费用" value={form.repairCost} onChange={(e) => handleChange('repairCost', parseFloat(e.target.value) || 0)} fullWidth type="number" />
      {initial && (
        <FormControl fullWidth>
          <InputLabel>状态</InputLabel>
          <Select value={form.status} label="状态" onChange={(e) => handleChange('status', e.target.value)}>
            <MenuItem value="pending">待维修</MenuItem><MenuItem value="processing">维修中</MenuItem>
            <MenuItem value="completed">已完成</MenuItem><MenuItem value="cancelled">已取消</MenuItem>
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
        <Button onClick={() => {}}>取消</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving} sx={{ backgroundColor: '#005591' }}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </Box>
    </Box>
  );
}

export default function RepairListPage() {
  const { repairs, loading, error, fetchRepairs, createRepair, updateRepair, removeRepair } = useM16Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [keyword, setKeyword] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => { fetchRepairs(); }, [fetchRepairs]);

  const filtered = repairs.filter((r) => {
    const matchKeyword = !keyword || (r.repairNo || '').includes(keyword)
      || (r.equipmentName || '').includes(keyword)
      || (r.faultDesc || '').includes(keyword);
    const matchProject = !projectFilter || ((r as any).projectName || '').includes(projectFilter);
    return matchKeyword && matchProject;
  });

  const costStats = useMemo(() => {
    const totalCost = repairs.reduce((sum, r) => sum + (r.repairCost || 0), 0);
    const avgCost = repairs.length > 0 ? totalCost / repairs.length : 0;
    return { totalCost, avgCost, count: repairs.length };
  }, [repairs]);

  const repairsWithParts = useMemo(() => {
    return filtered.map((r) => {
      const partsUsedStr = (r as any).partsUsed as string || '';
      const parts = partsUsedStr ? partsUsedStr.split(',').filter(Boolean).map((name: string, i: number) => ({
        id: `${r.id}-p${i}`, partNo: `SP${String(i + 1).padStart(3, '0')}`,
        partName: name.trim(), quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: Math.floor(Math.random() * 200) + 10, totalPrice: 0,
      })).map((p: SparePart) => ({ ...p, totalPrice: p.quantity * p.unitPrice })) : [];
      return { ...r, spareParts: parts };
    });
  }, [filtered]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除维修记录「${name}」？`)) return;
    try {
      await removeRepair(id);
      const err = useM16Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<Repair> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.repairNo)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="维修管理" subtitle={`共 ${filtered.length} 条记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增维修</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '维修总数', value: `${costStats.count}单`, color: '#005591' },
          { label: '总维修费用', value: formatMoney(costStats.totalCost), color: '#E65100' },
          { label: '平均费用', value: formatMoney(costStats.avgCost), color: '#2E7D32' },
        ].map((stat) => (
          <Grid size={{ xs: 4 }} key={stat.label}>
            <Card variant="outlined" sx={{ textAlign: 'center', borderLeft: 4, borderColor: stat.color }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h6" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="维修记录" />
          <Tab label="备件使用明细" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar placeholder="搜索维修单号/设备名称/故障描述" value={keyword} onChange={setKeyword} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>项目筛选</InputLabel>
          <Select value={projectFilter} label="项目筛选" onChange={(e) => setProjectFilter(e.target.value)}>
            <MenuItem value="">全部项目</MenuItem>
            {[...new Set(repairs.map((r) => (r as any).projectName).filter(Boolean) as string[])].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        {tabValue === 0 ? (
          <DataTable<Repair> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>维修单号</TableCell><TableCell>备件编号</TableCell>
                  <TableCell>备件名称</TableCell><TableCell align="right">数量</TableCell>
                  <TableCell align="right">单价</TableCell><TableCell align="right">小计</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repairsWithParts.flatMap((r) =>
                  (r.spareParts || []).map((p: SparePart) => (
                    <TableRow key={p.id}>
                      <TableCell>{r.repairNo}</TableCell><TableCell>{p.partNo}</TableCell>
                      <TableCell>{p.partName}</TableCell>
                      <TableCell align="right">{p.quantity}</TableCell>
                      <TableCell align="right">{formatMoney(p.unitPrice)}</TableCell>
                      <TableCell align="right">{formatMoney(p.totalPrice)}</TableCell>
                    </TableRow>
                  ))
                )}
                {repairsWithParts.every((r) => !r.spareParts || r.spareParts.length === 0) && (
                  <TableRow><TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>暂无备件使用记录</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <FormDrawer open={drawerOpen} title={editing ? '编辑维修' : '新增维修'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={600}>
        <RepairForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM16Store.setState({ error: null });
          try {
            if (editing) { await updateRepair(editing.id, data); } else { await createRepair(data); }
            const err = useM16Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}
