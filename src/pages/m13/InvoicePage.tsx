import { useEffect, useState } from 'react';
import {
  Button, Box, Tooltip, IconButton, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Typography, Card, CardContent, Grid, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM13Store } from '@/stores/useM13Store';
import { formatDate, formatMoney } from '@/utils/format';

interface Invoice {
  id: string;
  invoiceCode: string;
  invoiceNo: string;
  invoiceType: 'sales' | 'purchase';
  issueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  verificationStatus: string;
  customerName?: string;
  supplierName?: string;
  remark?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', issued: '已开具', received: '已接收',
  cancelled: '已作废', verified: '已认证',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  draft: 'default', issued: 'primary', received: 'info' as any,
  cancelled: 'error', verified: 'success',
};

const VERIFY_LABELS: Record<string, string> = {
  pending: '待认证', verified: '已认证', failed: '认证失败', notRequired: '无需认证',
};

const VERIFY_COLORS: Record<string, 'default' | 'success' | 'error' | 'info'> = {
  pending: 'warning' as any, verified: 'success', failed: 'error', notRequired: 'default',
};

const mockInvoices: Invoice[] = [
  { id: '1', invoiceCode: 'INV202606001', invoiceNo: '4401234567', invoiceType: 'sales', issueDate: '2026-06-15', amount: 50000, taxAmount: 6500, totalAmount: 56500, status: 'issued', verificationStatus: 'verified', customerName: '广州物流科技有限公司' },
  { id: '2', invoiceCode: 'INV202606002', invoiceNo: '4401234568', invoiceType: 'purchase', issueDate: '2026-06-14', amount: 32000, taxAmount: 4160, totalAmount: 36160, status: 'received', verificationStatus: 'verified', supplierName: '上海钢材贸易有限公司' },
  { id: '3', invoiceCode: 'INV202606003', invoiceNo: '4401234569', invoiceType: 'sales', issueDate: '2026-06-13', amount: 78000, taxAmount: 10140, totalAmount: 88140, status: 'issued', verificationStatus: 'pending', customerName: '深圳智能仓储有限公司' },
  { id: '4', invoiceCode: 'INV202606004', invoiceNo: '4401234570', invoiceType: 'purchase', issueDate: '2026-06-12', amount: 15000, taxAmount: 1950, totalAmount: 16950, status: 'cancelled', verificationStatus: 'notRequired', supplierName: '北京物流设备有限公司' },
  { id: '5', invoiceCode: 'INV202606005', invoiceNo: '4401234571', invoiceType: 'sales', issueDate: '2026-06-11', amount: 120000, taxAmount: 15600, totalAmount: 135600, status: 'draft', verificationStatus: 'pending', customerName: '成都货架制造有限公司' },
  { id: '6', invoiceCode: 'INV202606006', invoiceNo: '4401234572', invoiceType: 'purchase', issueDate: '2026-06-10', amount: 45000, taxAmount: 5850, totalAmount: 50850, status: 'received', verificationStatus: 'failed', supplierName: '武汉物流系统有限公司' },
];

export default function InvoicePage() {
  const { loading } = useM13Store();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({});

  useEffect(() => {
    setInvoices(mockInvoices);
  }, []);

  const filtered = invoices.filter((inv) => {
    const matchKeyword = !keyword ||
      (inv.invoiceCode || '').includes(keyword) ||
      (inv.invoiceNo || '').includes(keyword) ||
      (inv.customerName || '').includes(keyword) ||
      (inv.supplierName || '').includes(keyword);
    const matchType = !typeFilter || inv.invoiceType === typeFilter;
    const matchStatus = !statusFilter || inv.status === statusFilter;
    return matchKeyword && matchType && matchStatus;
  });

  const totalAmount = filtered.reduce((s, i) => s + i.totalAmount, 0);
  const totalTax = filtered.reduce((s, i) => s + i.taxAmount, 0);

  const columns: Column<Invoice>[] = [
    { id: 'invoiceCode', label: '发票编号', sortable: true, width: 150 },
    { id: 'invoiceNo', label: '发票号码', width: 140 },
    {
      id: 'invoiceType', label: '发票类型', width: 100,
      render: (r) => (
        <Chip
          label={r.invoiceType === 'sales' ? '销项' : '进项'}
          size="small"
          color={r.invoiceType === 'sales' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      ),
    },
    { id: 'issueDate', label: '开票日期', width: 110, render: (r) => formatDate(r.issueDate) },
    { id: 'amount', label: '金额', align: 'right' as const, width: 110, render: (r) => formatMoney(r.amount) },
    { id: 'taxAmount', label: '税额', align: 'right' as const, width: 100, render: (r) => formatMoney(r.taxAmount) },
    { id: 'totalAmount', label: '价税合计', align: 'right' as const, width: 120, render: (r) => formatMoney(r.totalAmount) },
    {
      id: 'status', label: '状态', width: 90,
      render: (r) => <Chip label={STATUS_LABELS[r.status] || r.status} size="small" color={STATUS_COLORS[r.status] || 'default'} />,
    },
    {
      id: 'verificationStatus', label: '认证状态', width: 100,
      render: (r) => <Chip label={VERIFY_LABELS[r.verificationStatus] || r.verificationStatus} size="small" color={VERIFY_COLORS[r.verificationStatus] || 'default'} variant="outlined" />,
    },
    {
      id: 'counterparty', label: '对方单位', width: 180,
      render: (r) => r.customerName || r.supplierName || '-',
    },
  ];

  const openAdd = () => {
    setEditing(null);
    setForm({
      invoiceCode: `INV${Date.now()}`,
      invoiceNo: '', invoiceType: 'sales', issueDate: new Date().toISOString().slice(0, 10),
      amount: 0, taxAmount: 0, totalAmount: 0, status: 'draft', verificationStatus: 'pending',
    });
    setDialogOpen(true);
  };

  const openEdit = (inv: Invoice) => {
    setEditing(inv);
    setForm({ ...inv });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.invoiceNo) { alert('请输入发票号码'); return; }
    if (editing) {
      setInvoices((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...form } as Invoice : i)));
    } else {
      const newInv: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceCode: form.invoiceCode || '',
        invoiceNo: form.invoiceNo || '',
        invoiceType: form.invoiceType as 'sales' | 'purchase',
        issueDate: form.issueDate || '',
        amount: form.amount || 0,
        taxAmount: (form.amount || 0) * 0.13,
        totalAmount: (form.amount || 0) * 1.13,
        status: form.status || 'draft',
        verificationStatus: form.verificationStatus || 'pending',
        customerName: form.customerName,
        supplierName: form.supplierName,
      };
      setInvoices((prev) => [newInv, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (!window.confirm(`确定删除发票「${code}」？`)) return;
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleVerify = (id: string) => {
    setInvoices((prev) => prev.map((i) =>
      i.id === id ? { ...i, verificationStatus: 'verified' } : i
    ));
  };

  const actionColumn: Column<Invoice> = {
    id: 'actions', label: '操作', width: 150,
    render: (r) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="编辑">
          <IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
        {r.verificationStatus === 'pending' && (
          <Tooltip title="认证">
            <IconButton size="small" color="success" onClick={() => handleVerify(r.id)}>
              <VerifiedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="删除">
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.invoiceCode)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="发票管理" subtitle={`共 ${filtered.length} 张发票`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ backgroundColor: '#005591' }}>
            新增发票
          </Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">发票数量</Typography>
              <Typography variant="h6">{filtered.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">价税合计</Typography>
              <Typography variant="h6" color="primary.main">{formatMoney(totalAmount)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">税额合计</Typography>
              <Typography variant="h6" color="warning.main">{formatMoney(totalTax)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">待认证</Typography>
              <Typography variant="h6" color="error.main">
                {filtered.filter((i) => i.verificationStatus === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar placeholder="搜索发票编号/号码/对方单位" value={keyword} onChange={setKeyword} />
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>发票类型</InputLabel>
          <Select value={typeFilter} label="发票类型" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="sales">销项发票</MenuItem>
            <MenuItem value="purchase">进项发票</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>状态</InputLabel>
          <Select value={statusFilter} label="状态" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="draft">草稿</MenuItem>
            <MenuItem value="issued">已开具</MenuItem>
            <MenuItem value="received">已接收</MenuItem>
            <MenuItem value="cancelled">已作废</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Invoice>
          columns={[...columns, actionColumn]} rows={filtered}
          rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? '编辑发票' : '新增发票'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
            <TextField label="发票编号" value={form.invoiceCode || ''}
              onChange={(e) => setForm({ ...form, invoiceCode: e.target.value })} fullWidth />
            <TextField label="发票号码" value={form.invoiceNo || ''} required
              onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel>发票类型</InputLabel>
              <Select value={form.invoiceType || 'sales'} label="发票类型"
                onChange={(e) => setForm({ ...form, invoiceType: e.target.value as any })}>
                <MenuItem value="sales">销项发票</MenuItem>
                <MenuItem value="purchase">进项发票</MenuItem>
              </Select>
            </FormControl>
            <TextField label="开票日期" type="date" value={form.issueDate || ''}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="金额" type="number" value={form.amount || ''}
              onChange={(e) => {
                const amt = parseFloat(e.target.value) || 0;
                setForm({ ...form, amount: amt, taxAmount: amt * 0.13, totalAmount: amt * 1.13 });
              }} fullWidth />
            <TextField label="税额" type="number" value={form.taxAmount || 0} disabled fullWidth />
            <TextField label="价税合计" type="number" value={form.totalAmount || 0} disabled fullWidth />
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select value={form.status || 'draft'} label="状态"
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="draft">草稿</MenuItem>
                <MenuItem value="issued">已开具</MenuItem>
                <MenuItem value="received">已接收</MenuItem>
                <MenuItem value="cancelled">已作废</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>认证状态</InputLabel>
              <Select value={form.verificationStatus || 'pending'} label="认证状态"
                onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}>
                <MenuItem value="pending">待认证</MenuItem>
                <MenuItem value="verified">已认证</MenuItem>
                <MenuItem value="failed">认证失败</MenuItem>
                <MenuItem value="notRequired">无需认证</MenuItem>
              </Select>
            </FormControl>
            <TextField label={form.invoiceType === 'sales' ? '客户名称' : '供应商名称'}
              value={form.customerName || form.supplierName || ''}
              onChange={(e) => {
                if (form.invoiceType === 'sales') {
                  setForm({ ...form, customerName: e.target.value });
                } else {
                  setForm({ ...form, supplierName: e.target.value });
                }
              }} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#005591' }}>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
