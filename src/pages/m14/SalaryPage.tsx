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
import type { SalaryRecord } from '@/types/m14';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', approved: '已审批', paid: '已发放',
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'default', submitted: 'info', approved: 'warning', paid: 'success',
};

const columns: Column<SalaryRecord>[] = [
  { id: 'employeeName', label: '员工', sortable: true, width: 100 },
  { id: 'salaryMonth', label: '月份', sortable: true, width: 100 },
  { id: 'baseSalary', label: '基本工资', sortable: true, width: 110, render: (r) => `¥${r.baseSalary.toLocaleString()}` },
  { id: 'bonus', label: '奖金', width: 90, render: (r) => r.bonus ? `¥${r.bonus.toLocaleString()}` : '-' },
  { id: 'socialInsurance', label: '社保', width: 90, render: (r) => `¥${r.socialInsurance.toLocaleString()}` },
  { id: 'housingFund', label: '公积金', width: 90, render: (r) => `¥${r.housingFund.toLocaleString()}` },
  { id: 'actualAmount', label: '实发金额', width: 120, render: (r) => `¥${r.actualAmount.toLocaleString()}` },
  { id: 'status', label: '状态', width: 90, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} color={STATUS_COLORS[r.status] as any} />
  )},
];

export default function SalaryPage() {
  const { salary, employees, loading, error, fetchSalary, fetchEmployees, createSalary, updateSalary, removeSalary } = useM14Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryRecord | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchSalary(); fetchEmployees(); }, [fetchSalary, fetchEmployees]);

  const filtered = salary.filter((s) =>
    (s.employeeName || '').includes(keyword) || (s.salaryMonth || '').includes(keyword)
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此薪资记录？')) return;
    try {
      await removeSalary(id);
      const err = useM14Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<SalaryRecord> = {
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
      <PageHeader title="薪酬管理" subtitle={`共 ${filtered.length} 条薪资记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增薪资</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索员工/月份" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<SalaryRecord> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑薪资' : '新增薪资'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <SalaryForm initial={editing ?? undefined} employees={employees} onSubmit={async (data) => {
          useM14Store.setState({ error: null });
          try {
            if (editing) { await updateSalary(editing.id, data); } else { await createSalary(data); }
            const err = useM14Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function SalaryForm({ initial, employees, onSubmit }: { initial?: SalaryRecord; employees: any[]; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    employeeId: initial?.employeeId ?? '',
    employeeName: initial?.employeeName ?? '',
    salaryMonth: initial?.salaryMonth ?? '2026-06',
    baseSalary: initial?.baseSalary ?? 0,
    overtimePay: initial?.overtimePay ?? 0,
    bonus: initial?.bonus ?? 0,
    allowance: initial?.allowance ?? 0,
    deduction: initial?.deduction ?? 0,
    socialInsurance: initial?.socialInsurance ?? 0,
    housingFund: initial?.housingFund ?? 0,
    remark: initial?.remark ?? '',
  });
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: field === 'baseSalary' || field.startsWith('overtime') || field === 'bonus' || field === 'allowance' || field === 'deduction' || field.startsWith('social') || field.startsWith('housing') ? Number(val) : val }));
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
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>薪资月份 *</label>
        <input value={form.salaryMonth} onChange={handleChange('salaryMonth')} placeholder="YYYY-MM" required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>基本工资 *</label>
          <input type="number" value={form.baseSalary} onChange={handleChange('baseSalary')} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>加班工资</label>
          <input type="number" value={form.overtimePay} onChange={handleChange('overtimePay')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>奖金</label>
          <input type="number" value={form.bonus} onChange={handleChange('bonus')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>补贴</label>
          <input type="number" value={form.allowance} onChange={handleChange('allowance')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>扣款</label>
          <input type="number" value={form.deduction} onChange={handleChange('deduction')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>社保</label>
          <input type="number" value={form.socialInsurance} onChange={handleChange('socialInsurance')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>公积金</label>
        <input type="number" value={form.housingFund} onChange={handleChange('housingFund')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
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
