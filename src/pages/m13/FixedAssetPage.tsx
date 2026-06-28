import { useEffect, useState } from 'react';
import { Button, Box, Tooltip, IconButton, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM13Store } from '@/stores/useM13Store';
import { formatDate, formatMoney } from '@/utils/format';

interface DepreciationSchedule {
  year: number;
  month: number;
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  netValue: number;
}

interface FixedAsset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  originalValue: number;
  monthlyDepreciation: number;
  accumulatedDepreciation: number;
  netValue: number;
  purchaseDate: string;
  usefulLife: number;
  status: string;
  department: string;
  location: string;
  schedule: DepreciationSchedule[];
}

const ASSET_CATEGORIES = ['办公设备', '生产设备', '运输工具', '电子设备', '房屋建筑', '其他'];
const ASSET_STATUS_LABELS: Record<string, string> = { active: '使用中', idle: '闲置', scrap: '已报废', repairing: '维修中' };
const ASSET_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info'> = { active: 'success', idle: 'warning', scrap: 'error', repairing: 'info' };

function generateMockSchedule(originalValue: number, usefulLife: number): DepreciationSchedule[] {
  const schedule: DepreciationSchedule[] = [];
  const monthly = usefulLife > 0 ? originalValue / (usefulLife * 12) : 0;
  let accumulated = 0;
  let net = originalValue;
  for (let y = 1; y <= Math.min(usefulLife, 3); y++) {
    for (let m = 1; m <= 12; m++) {
      accumulated += monthly;
      net = Math.max(0, originalValue - accumulated);
      schedule.push({ year: y, month: m, monthlyDepreciation: monthly, accumulatedDepreciation: accumulated, netValue: net });
      if (net <= 0) break;
    }
  }
  return schedule;
}

export default function FixedAssetPage() {
  const { loading, error } = useM13Store();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FixedAsset | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [form, setForm] = useState({
    assetCode: '', name: '', category: '办公设备', originalValue: 0,
    purchaseDate: '', usefulLife: 5, department: '', location: '', status: 'active',
  });

  useEffect(() => {
    // Mock data
    setAssets([
      { id: '1', assetCode: 'FA2026001', name: '数控冲床', category: '生产设备', originalValue: 580000, monthlyDepreciation: 4833.33, accumulatedDepreciation: 145000, netValue: 435000, purchaseDate: '2024-01-15', usefulLife: 10, status: 'active', department: '生产部', location: 'A车间', schedule: generateMockSchedule(580000, 10) },
      { id: '2', assetCode: 'FA2026002', name: '激光切割机', category: '生产设备', originalValue: 920000, monthlyDepreciation: 7666.67, accumulatedDepreciation: 230000, netValue: 690000, purchaseDate: '2023-08-20', usefulLife: 10, status: 'active', department: '生产部', location: 'A车间', schedule: generateMockSchedule(920000, 10) },
      { id: '3', assetCode: 'FA2026003', name: 'ERP服务器', category: '电子设备', originalValue: 86000, monthlyDepreciation: 2388.89, accumulatedDepreciation: 43000, netValue: 43000, purchaseDate: '2023-06-10', usefulLife: 3, status: 'active', department: 'IT部', location: '机房', schedule: generateMockSchedule(86000, 3) },
      { id: '4', assetCode: 'FA2026004', name: '办公大楼', category: '房屋建筑', originalValue: 8500000, monthlyDepreciation: 35416.67, accumulatedDepreciation: 850000, netValue: 7650000, purchaseDate: '2021-03-01', usefulLife: 20, status: 'active', department: '行政部', location: '总部', schedule: generateMockSchedule(8500000, 20) },
      { id: '5', assetCode: 'FA2026005', name: '叉车', category: '运输工具', originalValue: 65000, monthlyDepreciation: 1083.33, accumulatedDepreciation: 39000, netValue: 26000, purchaseDate: '2022-09-15', usefulLife: 5, status: 'active', department: '仓储部', location: '仓库', schedule: generateMockSchedule(65000, 5) },
      { id: '6', assetCode: 'FA2026006', name: '焊机', category: '生产设备', originalValue: 28000, monthlyDepreciation: 466.67, accumulatedDepreciation: 25200, netValue: 2800, purchaseDate: '2020-05-01', usefulLife: 5, status: 'repairing', department: '生产部', location: 'B车间', schedule: generateMockSchedule(28000, 5) },
      { id: '7', assetCode: 'FA2026007', name: '打印机', category: '办公设备', originalValue: 12000, monthlyDepreciation: 200, accumulatedDepreciation: 12000, netValue: 0, purchaseDate: '2020-01-10', usefulLife: 5, status: 'scrap', department: '行政部', location: '办公室', schedule: generateMockSchedule(12000, 5) },
      { id: '8', assetCode: 'FA2026008', name: '空压机', category: '生产设备', originalValue: 45000, monthlyDepreciation: 750, accumulatedDepreciation: 18000, netValue: 27000, purchaseDate: '2023-02-20', usefulLife: 5, status: 'idle', department: '生产部', location: 'C车间', schedule: generateMockSchedule(45000, 5) },
    ]);
  }, []);

  const filtered = assets.filter((a) =>
    ((a.assetCode || '').includes(keyword) || (a.name || '').includes(keyword) || (a.department || '').includes(keyword)) &&
    (!categoryFilter || a.category === categoryFilter)
  );

  const handleSave = () => {
    if (editing) {
      setAssets((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...form } : a)));
    } else {
      const newAsset: FixedAsset = {
        id: `FA${Date.now()}`, ...form,
        accumulatedDepreciation: 0, netValue: form.originalValue,
        schedule: generateMockSchedule(form.originalValue, form.usefulLife),
      };
      setAssets((prev) => [newAsset, ...prev]);
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`确定删除资产「${name}」？`)) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const columns: Column<FixedAsset>[] = [
    { id: 'assetCode', label: '资产编码', sortable: true, width: 120 },
    { id: 'name', label: '资产名称', sortable: true, width: 150 },
    { id: 'category', label: '类别', width: 100, render: (r) => <Chip label={r.category} size="small" variant="outlined" /> },
    { id: 'originalValue', label: '原值', width: 120, align: 'right', render: (r) => formatMoney(r.originalValue) },
    { id: 'monthlyDepreciation', label: '月折旧', width: 110, align: 'right', render: (r) => formatMoney(r.monthlyDepreciation) },
    { id: 'accumulatedDepreciation', label: '累计折旧', width: 120, align: 'right', render: (r) => formatMoney(r.accumulatedDepreciation) },
    { id: 'netValue', label: '净值', width: 120, align: 'right', render: (r) => <Typography fontWeight={600}>{formatMoney(r.netValue)}</Typography> },
    { id: 'status', label: '状态', width: 90, render: (r) => (
      <Chip label={ASSET_STATUS_LABELS[r.status] || r.status} color={ASSET_STATUS_COLORS[r.status] || 'default'} size="small" />
    )},
  ];

  const actionColumn: Column<FixedAsset> = {
    id: 'actions', label: '操作', width: 140,
    render: (r) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="折旧明细">
          <IconButton size="small" onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}>
            {expandedRow === r.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => { setEditing(r); setForm({ assetCode: r.assetCode, name: r.name, category: r.category, originalValue: r.originalValue, purchaseDate: r.purchaseDate, usefulLife: r.usefulLife, department: r.department, location: r.location, status: r.status }); setDrawerOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.name)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="固定资产管理" subtitle={`共 ${filtered.length} 项资产`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm({ assetCode: `FA${Date.now()}`, name: '', category: '办公设备', originalValue: 0, purchaseDate: '', usefulLife: 5, department: '', location: '', status: 'active' }); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>
            新增资产
          </Button>}
      />

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: '资产总数', value: assets.length, unit: '项' },
          { label: '资产原值', value: formatMoney(assets.reduce((s, a) => s + a.originalValue, 0)), unit: '' },
          { label: '累计折旧', value: formatMoney(assets.reduce((s, a) => s + a.accumulatedDepreciation, 0)), unit: '' },
          { label: '资产净值', value: formatMoney(assets.reduce((s, a) => s + a.netValue, 0)), unit: '' },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h6" fontWeight={700} color="#005591">{stat.value}{stat.unit}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <SearchBar placeholder="搜索资产编码/名称/部门" value={keyword} onChange={setKeyword} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>类别筛选</InputLabel>
          <Select value={categoryFilter} label="类别筛选" onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="">全部</MenuItem>
            {ASSET_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<FixedAsset>
          columns={[...columns, actionColumn]}
          rows={filtered}
          rowKey="id"
          loading={loading}
          page={0}
          pageSize={20}
          total={filtered.length}
          expandableRow={{
            expandedRowId: expandedRow,
            render: (row) => (
              <Box sx={{ p: 2, bgcolor: '#F5F7FA' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>折旧明细表</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>年度</TableCell>
                        <TableCell>月份</TableCell>
                        <TableCell align="right">月折旧额</TableCell>
                        <TableCell align="right">累计折旧</TableCell>
                        <TableCell align="right">净值</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {row.schedule.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.year}</TableCell>
                          <TableCell>{s.month}月</TableCell>
                          <TableCell align="right">{formatMoney(s.monthlyDepreciation)}</TableCell>
                          <TableCell align="right">{formatMoney(s.accumulatedDepreciation)}</TableCell>
                          <TableCell align="right">{formatMoney(s.netValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ),
          }}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? '编辑资产' : '新增资产'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField label="资产编码" value={form.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} fullWidth required />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="资产名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>资产类别</InputLabel>
                  <Select value={form.category} label="资产类别" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {ASSET_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>状态</InputLabel>
                  <Select value={form.status} label="状态" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <MenuItem value="active">使用中</MenuItem>
                    <MenuItem value="idle">闲置</MenuItem>
                    <MenuItem value="repairing">维修中</MenuItem>
                    <MenuItem value="scrap">已报废</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="原值" value={form.originalValue} onChange={(e) => setForm({ ...form, originalValue: parseFloat(e.target.value) || 0 })} fullWidth type="number" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="使用年限(年)" value={form.usefulLife} onChange={(e) => setForm({ ...form, usefulLife: parseInt(e.target.value) || 0 })} fullWidth type="number" />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="购置日期" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} fullWidth type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="使用部门" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="存放位置" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} fullWidth />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDrawerOpen(false); setEditing(null); }}>取消</Button>
          <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#005591' }}>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
