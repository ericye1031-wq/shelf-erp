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
import { formatDate } from '@/utils/format';
import type { Employee } from '@/types/m14';

const STATUS_LABELS: Record<string, string> = {
  active: '在职', resigned: '离职', suspended: '停职', retired: '退休',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'success', resigned: 'error', suspended: 'warning', retired: 'default',
};

const columns: Column<Employee>[] = [
  { id: 'code', label: '工号', sortable: true, width: 120 },
  { id: 'name', label: '姓名', sortable: true, width: 100 },
  { id: 'gender', label: '性别', width: 80, render: (r) => r.gender === 'male' ? '男' : '女' },
  { id: 'departmentName', label: '部门', sortable: true, width: 120, render: (r) => r.departmentName || '-' },
  { id: 'position', label: '职位', sortable: true, width: 120, render: (r) => r.position || '-' },
  { id: 'phone', label: '手机号', width: 130, render: (r) => r.phone || '-' },
  { id: 'hireDate', label: '入职日期', width: 110, render: (r) => r.hireDate ? formatDate(r.hireDate) : '-' },
  { id: 'status', label: '状态', width: 90, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} color={STATUS_COLORS[r.status] as any} />
  )},
];

export default function EmployeeListPage() {
  const { employees, loading, error, fetchEmployees, createEmployee, updateEmployee, removeEmployee } = useM14Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const filtered = employees.filter((e) =>
    (e.code || '').includes(keyword) || (e.name || '').includes(keyword) || (e.departmentName || '').includes(keyword)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除员工「${name}」？`)) return;
    try {
      await removeEmployee(id);
      const err = useM14Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<Employee> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id, r.name)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="员工管理" subtitle={`共 ${filtered.length} 名员工`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增员工</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索工号/姓名/部门" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<Employee> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑员工' : '新增员工'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <EmployeeForm initial={editing ?? undefined} onSubmit={async (data) => {
          useM14Store.setState({ error: null });
          try {
            if (editing) { await updateEmployee(editing.id, data); } else { await createEmployee(data); }
            const err = useM14Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function EmployeeForm({ initial, onSubmit }: { initial?: Employee; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    gender: initial?.gender ?? 'male',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    departmentName: initial?.departmentName ?? '',
    position: initial?.position ?? '',
    hireDate: initial?.hireDate ?? '',
    idNumber: initial?.idNumber ?? '',
    remark: initial?.remark ?? '',
  });
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
        <Alert severity="info" sx={{ mb: 2 }}>工号将自动生成</Alert>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontSize: 12, mb: 4 }}>姓名 *</label>
            <input required value={form.name} onChange={handleChange('name')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>性别 *</label>
            <select value={form.gender} onChange={handleChange('gender')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>手机号</label>
            <input value={form.phone} onChange={handleChange('phone')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>邮箱</label>
            <input value={form.email} onChange={handleChange('email')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>部门</label>
            <input value={form.departmentName} onChange={handleChange('departmentName')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <label style={{ fontSize: 12 }}>职位</label>
            <input value={form.position} onChange={handleChange('position')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: 12 }}>入职日期</label>
          <input type="date" value={form.hireDate} onChange={handleChange('hireDate')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: 12 }}>身份证号</label>
          <input value={form.idNumber} onChange={handleChange('idNumber')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: 12 }}>备注</label>
          <input value={form.remark} onChange={handleChange('remark')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" type="submit" sx={{ backgroundColor: '#005591' }}>提交</Button>
          <Button variant="outlined" onClick={() => onSubmit(form)}>取消</Button>
        </Box>
      </Box>
    </div>
  );
}
