import { useEffect, useState } from 'react';
import {
  Button, Box, Tooltip, IconButton, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Typography, Card, CardContent, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import PaidIcon from '@mui/icons-material/Paid';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM13Store } from '@/stores/useM13Store';
import { formatDate, formatMoney } from '@/utils/format';

interface ExpenseReimbursement {
  id: string;
  expenseCode: string;
  applicantName: string;
  expenseType: string;
  amount: number;
  applyDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  department: string;
  description: string;
  approvedBy: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  remark: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

const EXPENSE_TYPES = ['差旅费', '办公费', '招待费', '交通费', '通讯费', '培训费', '其他'];

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', approved: '已审批', rejected: '已驳回', paid: '已付款',
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
  draft: 'default', submitted: 'info', approved: 'success', rejected: 'error', paid: 'primary',
};

const columns: Column<ExpenseReimbursement>[] = [
  { id: 'expenseCode', label: '报销单号', sortable: true, width: 140 },
  { id: 'applicantName', label: '申请人', width: 100 },
  { id: 'expenseType', label: '费用类型', width: 100,
    render: (r) => <Chip label={r.expenseType} size="small" variant="outlined" /> },
  { id: 'amount', label: '金额', align: 'right', width: 120,
    render: (r) => formatMoney(r.amount) },
  { id: 'applyDate', label: '申请日期', width: 110,
    render: (r) => formatDate(r.applyDate) },
  { id: 'department', label: '部门', width: 100 },
  { id: 'status', label: '状态', width: 100,
    render: (r) => (
      <Chip
        label={STATUS_LABELS[r.status] || r.status}
        color={STATUS_COLORS[r.status] || 'default'}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    ) },
  { id: 'description', label: '描述', render: (r) => r.description || '-' },
];

const MOCK_EXPENSES: ExpenseReimbursement[] = [
  { id: '1', expenseCode: 'EX202606001', applicantName: '张三', expenseType: '差旅费', amount: 3200.00, applyDate: '2026-06-01', status: 'paid', department: '技术部', description: '北京出差差旅费', approvedBy: '李总', approvedAt: '2026-06-03', paidAt: '2026-06-05', remark: null, createdBy: 'admin', createdAt: '2026-06-01', updatedBy: 'admin', updatedAt: '2026-06-05' },
  { id: '2', expenseCode: 'EX202606002', applicantName: '李四', expenseType: '办公费', amount: 850.00, applyDate: '2026-06-05', status: 'approved', department: '财务部', description: '办公用品采购', approvedBy: '李总', approvedAt: '2026-06-06', paidAt: null, remark: null, createdBy: 'admin', createdAt: '2026-06-05', updatedBy: 'admin', updatedAt: '2026-06-06' },
  { id: '3', expenseCode: 'EX202606003', applicantName: '王五', expenseType: '招待费', amount: 2100.00, applyDate: '2026-06-08', status: 'submitted', department: '销售部', description: '客户招待费', approvedBy: null, approvedAt: null, paidAt: null, remark: null, createdBy: 'admin', createdAt: '2026-06-08', updatedBy: 'admin', updatedAt: '2026-06-08' },
  { id: '4', expenseCode: 'EX202606004', applicantName: '赵六', expenseType: '交通费', amount: 450.00, applyDate: '2026-06-10', status: 'rejected', department: '行政部', description: '市内交通费报销', approvedBy: '李总', approvedAt: '2026-06-11', paidAt: null, remark: '发票不合规', createdBy: 'admin', createdAt: '2026-06-10', updatedBy: 'admin', updatedAt: '2026-06-11' },
  { id: '5', expenseCode: 'EX202606005', applicantName: '钱七', expenseType: '培训费', amount: 5600.00, applyDate: '2026-06-12', status: 'draft', department: '人资部', description: '外部培训课程费', approvedBy: null, approvedAt: null, paidAt: null, remark: null, createdBy: 'admin', createdAt: '2026-06-12', updatedBy: 'admin', updatedAt: '2026-06-12' },
  { id: '6', expenseCode: 'EX202606006', applicantName: '孙八', expenseType: '差旅费', amount: 4800.00, applyDate: '2026-06-15', status: 'paid', department: '技术部', description: '上海出差差旅费', approvedBy: '李总', approvedAt: '2026-06-16', paidAt: '2026-06-18', remark: null, createdBy: 'admin', createdAt: '2026-06-15', updatedBy: 'admin', updatedAt: '2026-06-18' },
];

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseReimbursement[]>(MOCK_EXPENSES);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseReimbursement | null>(null);
  const [form, setForm] = useState({
    expenseCode: '', applicantName: '', expenseType: '差旅费', amount: 0,
    applyDate: '', department: '', description: '', status: 'draft' as string,
  });

  const filtered = expenses.filter((e) => {
    const matchKeyword = !keyword || (e.expenseCode || '').includes(keyword) || (e.applicantName || '').includes(keyword) || (e.description || '').includes(keyword);
    const matchStatus = !statusFilter || e.status === statusFilter;
    const matchType = !typeFilter || e.expenseType === typeFilter;
    return matchKeyword && matchStatus && matchType;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ expenseCode: `EX${Date.now()}`, applicantName: '', expenseType: '差旅费', amount: 0, applyDate: new Date().toISOString().slice(0, 10), department: '', description: '', status: 'draft' });
    setDialogOpen(true);
  };

  const openEdit = (row: ExpenseReimbursement) => {
    setEditing(row);
    setForm({ expenseCode: row.expenseCode, applicantName: row.applicantName, expenseType: row.expenseType, amount: row.amount, applyDate: row.applyDate, department: row.department, description: row.description, status: row.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setExpenses((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...form, amount: Number(form.amount), updatedAt: new Date().toISOString() } : e)));
    } else {
      const newExpense: ExpenseReimbursement = {
        id: String(Date.now()), expenseCode: form.expenseCode, applicantName: form.applicantName,
        expenseType: form.expenseType, amount: Number(form.amount), applyDate: form.applyDate,
        department: form.department, description: form.description, status: form.status as ExpenseReimbursement['status'],
        approvedBy: null, approvedAt: null, paidAt: null, remark: null,
        createdBy: 'admin', createdAt: new Date().toISOString(), updatedBy: 'admin', updatedAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (!window.confirm(`确定删除报销单「${code}」？`)) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setExpenses((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const patch: Partial<ExpenseReimbursement> = { status: newStatus as ExpenseReimbursement['status'] };
      if (newStatus === 'approved') { patch.approvedBy = '当前用户'; patch.approvedAt = new Date().toISOString().slice(0, 10); }
      if (newStatus === 'paid') { patch.paidAt = new Date().toISOString().slice(0, 10); }
      return { ...e, ...patch };
    }));
  };

  const actionColumn: Column<ExpenseReimbursement> = {
    id: 'actions', label: '操作', width: 220,
    render: (r) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        {r.status === 'draft' && (
          <Tooltip title="提交"><IconButton size="small" color="primary" onClick={() => handleStatusChange(r.id, 'submitted')}><SendIcon fontSize="small" /></IconButton></Tooltip>
        )}
        {r.status === 'submitted' && (
          <>
            <Tooltip title="审批通过"><IconButton size="small" color="success" onClick={() => handleStatusChange(r.id, 'approved')}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="驳回"><IconButton size="small" color="error" onClick={() => handleStatusChange(r.id, 'rejected')}><CancelIcon fontSize="small" /></IconButton></Tooltip>
          </>
        )}
        {r.status === 'approved' && (
          <Tooltip title="标记已付款"><IconButton size="small" color="success" onClick={() => handleStatusChange(r.id, 'paid')}><PaidIcon fontSize="small" /></IconButton></Tooltip>
        )}
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.expenseCode)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  const statusCounts: Record<string, number> = {};
  expenses.forEach((e) => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });

  return (
    <>
      <PageHeader title="费用报销" subtitle={`共 ${filtered.length} 条记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ backgroundColor: '#005591' }}>新增报销</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Card key={key} sx={{ minWidth: 100, flex: 1, bgcolor: statusFilter === key ? '#E3F2FD' : '#fff', border: statusFilter === key ? '2px solid #005591' : '1px solid #e0e0e0', cursor: 'pointer' }} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5" fontWeight={700} color="#005591">{statusCounts[key] || 0}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <SearchBar placeholder="搜索报销单号/申请人/描述" value={keyword} onChange={setKeyword} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>费用类型</InputLabel>
          <Select value={typeFilter} label="费用类型" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="">全部</MenuItem>
            {EXPENSE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<ExpenseReimbursement> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑报销单' : '新增报销单'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="报销单号" value={form.expenseCode} onChange={(e) => setForm({ ...form, expenseCode: e.target.value })} fullWidth />
            <TextField label="申请人" value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>费用类型</InputLabel>
              <Select value={form.expenseType} label="费用类型" onChange={(e) => setForm({ ...form, expenseType: e.target.value })}>
                {EXPENSE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="金额" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} fullWidth type="number" required />
            <TextField label="申请日期" value={form.applyDate} onChange={(e) => setForm({ ...form, applyDate: e.target.value })} fullWidth type="date" InputLabelProps={{ shrink: true }} />
            <TextField label="部门" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} fullWidth />
            <TextField label="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select value={form.status} label="状态" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </Select>
            </FormControl>
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
