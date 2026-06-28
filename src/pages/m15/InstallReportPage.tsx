import { useEffect, useState } from 'react';
import { Button, Box, Alert, TextField, MenuItem, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { InstallReport } from '@/types/m15';

const columns: Column<InstallReport>[] = [
  { id: 'workerName', label: '工人', sortable: true, width: 100 },
  { id: 'workDate', label: '日期', sortable: true, width: 110,
    render: (r) => formatDate(r.workDate) },
  { id: 'startTime', label: '开始', width: 80,
    render: (r) => r.startTime || '-' },
  { id: 'endTime', label: '结束', width: 80,
    render: (r) => r.endTime || '-' },
  { id: 'overtimeHours', label: '加班', width: 80,
    render: (r) => r.overtimeHours > 0 ? `${r.overtimeHours}h` : '-' },
  { id: 'workContent', label: '工作内容', width: 200,
    render: (r) => r.workContent || '-' },
  { id: 'completionPercent', label: '进度', width: 80, align: 'right',
    render: (r) => <Chip label={`${r.completionPercent}%`} size="small" color="primary" /> },
];

export default function InstallReportPage() {
  const { plans, fetchPlans, reports, loading, error, fetchReports, createReport, removeReport } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { fetchPlans(); fetchReports(); }, []);

  const [form, setForm] = useState({
    planId: '', workerName: '', workDate: new Date().toISOString().slice(0, 10),
    startTime: '08:00', endTime: '17:00', overtimeHours: 0, workContent: '', completionPercent: 0,
  });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));

  const actionColumn: Column<InstallReport> = {
    id: 'actions', label: '操作', width: 80,
    render: (r) => (
      <Button size="small" color="error" onClick={async () => {
        if (!window.confirm('确定删除该报工记录？')) return;
        try { await removeReport(r.id); onSuccess('删除成功'); } catch (e) { onError(e); }
      }}>删除</Button>
    ),
  };

  return (
    <>
      <PageHeader title="安装报工" subtitle={`共 ${reports.length} 条记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)} sx={{ backgroundColor: '#005591' }}>新增报工</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <DataTable<InstallReport> columns={[...columns, actionColumn]} rows={reports} rowKey="id" loading={loading} page={0} pageSize={50} total={reports.length} />
      </Box>
      <FormDrawer open={drawerOpen} title="新增报工" onCancel={() => setDrawerOpen(false)} width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <TextField label="安装计划" value={form.planId} onChange={handleChange('planId')} size="small" select required>
            {plans.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} - {p.siteAddress}</MenuItem>)}
          </TextField>
          <TextField label="工人姓名" value={form.workerName} onChange={handleChange('workerName')} size="small" required />
          <TextField label="工作日期" type="date" value={form.workDate} onChange={handleChange('workDate')} size="small" InputLabelProps={{ shrink: true }} required />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="开始时间" type="time" value={form.startTime} onChange={handleChange('startTime')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="结束时间" type="time" value={form.endTime} onChange={handleChange('endTime')} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField label="加班小时" type="number" value={form.overtimeHours} onChange={handleChange('overtimeHours')} size="small" inputProps={{ min: 0, step: 0.5 }} />
          <TextField label="工作内容" value={form.workContent} onChange={handleChange('workContent')} size="small" multiline rows={2} />
          <TextField label="完工百分比" type="number" value={form.completionPercent} onChange={handleChange('completionPercent')} size="small" inputProps={{ min: 0, max: 100 }} />
          <Button variant="contained" onClick={async () => {
            if (!form.planId || !form.workerName) return;
            try {
              await createReport({ ...form, overtimeHours: Number(form.overtimeHours), completionPercent: Number(form.completionPercent) });
              const err = useM15Store.getState().error;
              if (err) { onError(err); } else { onSuccess('报工成功'); setDrawerOpen(false); }
            } catch (e) { onError(e); }
          }} sx={{ backgroundColor: '#005591' }}>提交</Button>
        </div>
      </FormDrawer>
    </>
  );
}
