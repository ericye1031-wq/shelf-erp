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
import type { AttendanceRecord } from '@/types/m14';

const STATUS_LABELS: Record<string, string> = {
  normal: '正常', late: '迟到', early: '早退', absent: '缺勤', leave: '请假', overtime: '加班',
};
const STATUS_COLORS: Record<string, string> = {
  normal: 'success', late: 'warning', early: 'warning', absent: 'error', leave: 'info', overtime: 'primary',
};

const columns: Column<AttendanceRecord>[] = [
  { id: 'employeeName', label: '员工姓名', sortable: true, width: 100 },
  { id: 'recordDate', label: '日期', sortable: true, width: 110, render: (r) => formatDate(r.recordDate) },
  { id: 'clockIn', label: '上班打卡', width: 100, render: (r) => r.clockIn || '-' },
  { id: 'clockOut', label: '下班打卡', width: 100, render: (r) => r.clockOut || '-' },
  { id: 'status', label: '状态', width: 90, render: (r) => (
    <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} color={STATUS_COLORS[r.status] as any} />
  )},
  { id: 'leaveType', label: '请假类型', width: 100, render: (r) => r.leaveType || '-' },
  { id: 'overtimeHours', label: '加班(h)', width: 80, render: (r) => r.overtimeHours ?? '-' },
];

export default function AttendancePage() {
  const { attendance, employees, loading, error, fetchAttendance, fetchEmployees, createAttendance, updateAttendance, removeAttendance } = useM14Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchAttendance(); fetchEmployees(); }, [fetchAttendance, fetchEmployees]);

  const filtered = attendance.filter((a) =>
    (a.employeeName || '').includes(keyword)
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此考勤记录？')) return;
    try {
      await removeAttendance(id);
      const err = useM14Store.getState().error;
      if (err) { onError(err); } else { onSuccess('删除成功'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const actionColumn: Column<AttendanceRecord> = {
    id: 'actions', label: '操作', width: 120,
    render: (r) => (
      <Box>
        <Tooltip title="编辑"><IconButton size="small" onClick={() => { setEditing(r); setDrawerOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    ),
  };

  return (
    <>
      <PageHeader title="考勤管理" subtitle={`共 ${filtered.length} 条考勤记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDrawerOpen(true); }} sx={{ backgroundColor: '#005591' }}>新增考勤</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SearchBar placeholder="搜索员工姓名" value={keyword} onChange={setKeyword} />
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<AttendanceRecord> columns={[...columns, actionColumn]} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
      </Box>
      <FormDrawer open={drawerOpen} title={editing ? '编辑考勤' : '新增考勤'} onCancel={() => { setDrawerOpen(false); setEditing(null); }} width={560}>
        <AttendanceForm initial={editing ?? undefined} employees={employees} onSubmit={async (data) => {
          useM14Store.setState({ error: null });
          try {
            if (editing) { await updateAttendance(editing.id, data); } else { await createAttendance(data); }
            const err = useM14Store.getState().error;
            if (err) { onError(err); } else { onSuccess(editing ? '更新成功' : '创建成功'); }
            setDrawerOpen(false); setEditing(null);
          } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
        }} />
      </FormDrawer>
    </>
  );
}

function AttendanceForm({ initial, employees, onSubmit }: { initial?: AttendanceRecord; employees: any[]; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    employeeId: initial?.employeeId ?? '',
    employeeName: initial?.employeeName ?? '',
    recordDate: initial?.recordDate ?? new Date().toISOString().slice(0, 10),
    clockIn: initial?.clockIn ?? '08:30',
    clockOut: initial?.clockOut ?? '17:30',
    status: initial?.status ?? 'normal',
    leaveType: initial?.leaveType ?? '',
    overtimeHours: initial?.overtimeHours ?? '',
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
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>日期 *</label>
        <input type="date" value={form.recordDate} onChange={handleChange('recordDate')} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>上班打卡</label>
          <input value={form.clockIn} onChange={handleChange('clockIn')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <label style={{ fontSize: 12 }}>下班打卡</label>
          <input value={form.clockOut} onChange={handleChange('clockOut')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
        <label style={{ fontSize: 12 }}>状态 *</label>
        <select value={form.status} onChange={handleChange('status')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
          <option value="normal">正常</option>
          <option value="late">迟到</option>
          <option value="early">早退</option>
          <option value="absent">缺勤</option>
          <option value="leave">请假</option>
          <option value="overtime">加班</option>
        </select>
      </Box>
      {form.status === 'leave' && (
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: 12 }}>请假类型</label>
          <input value={form.leaveType} onChange={handleChange('leaveType')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      )}
      {form.status === 'overtime' && (
        <Box sx={{ mb: 2 }}>
          <label style={{ fontSize: 12 }}>加班时长(h)</label>
          <input type="number" value={form.overtimeHours} onChange={handleChange('overtimeHours')} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
        </Box>
      )}
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
