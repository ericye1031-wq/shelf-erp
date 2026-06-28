import { useEffect, useState } from 'react';
import { Button, Box, Alert, TextField, MenuItem, Chip, Grid, Card, CardContent, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { InstallAcceptance } from '@/types/m15';

const RESULT_LABELS: Record<string, string> = {
  passed: '通过', with_issues: '带问题通过', failed: '不通过',
};
const RESULT_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  passed: 'success', with_issues: 'warning', failed: 'error',
};

export default function AcceptancePage() {
  const { plans, fetchPlans, acceptances, loading, error, fetchAcceptances, createAcceptance } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => { fetchPlans(); }, []);

  useEffect(() => {
    acceptances.splice(0);
    plans.forEach((p) => { fetchAcceptances(p.id); });
  }, [plans]);

  const [form, setForm] = useState({
    planId: '', acceptDate: new Date().toISOString().slice(0, 10),
    result: 'passed', issueDesc: '', warrantyStartDate: '', warrantyEndDate: '',
  });
  const handleChange = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }));

  return (
    <>
      <PageHeader title="验收管理" subtitle={`共 ${acceptances.length} 条验收记录`}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)} sx={{ backgroundColor: '#005591' }}>创建验收</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />
        <Grid container spacing={2}>
          {acceptances.map((a) => {
            const plan = plans.find((p) => p.id === a.planId);
            const now = new Date();
            const warrantyEnd = a.warrantyEndDate ? new Date(a.warrantyEndDate) : null;
            const daysLeft = warrantyEnd ? Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={a.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{plan?.code || a.planId}</Typography>
                      <Chip label={RESULT_LABELS[a.result]} size="small" color={RESULT_COLORS[a.result]} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{plan?.siteAddress || '-'}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">验收日期: {a.acceptDate ? formatDate(a.acceptDate) : '-'}</Typography>
                    </Box>
                    {a.warrantyStartDate && a.warrantyEndDate && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          质保期: {formatDate(a.warrantyStartDate)} ~ {formatDate(a.warrantyEndDate)}
                        </Typography>
                        {daysLeft !== null && (
                          <Chip
                            label={daysLeft > 0 ? `剩余 ${daysLeft} 天` : '已过期'}
                            size="small"
                            color={daysLeft > 30 ? 'success' : daysLeft > 0 ? 'warning' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    )}
                    {a.issueDesc && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="warning.main">整改: {a.issueDesc}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <FormDrawer open={drawerOpen} title="创建验收" onCancel={() => setDrawerOpen(false)} width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <TextField label="安装计划" value={form.planId} onChange={handleChange('planId')} size="small" select required>
            {plans.map((p) => <MenuItem key={p.id} value={p.id}>{p.code} - {p.siteAddress}</MenuItem>)}
          </TextField>
          <TextField label="验收日期" type="date" value={form.acceptDate} onChange={handleChange('acceptDate')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="验收结果" value={form.result} onChange={handleChange('result')} size="small" select required>
            <MenuItem value="passed">通过</MenuItem>
            <MenuItem value="with_issues">带问题通过</MenuItem>
            <MenuItem value="failed">不通过</MenuItem>
          </TextField>
          <TextField label="整改问题" value={form.issueDesc} onChange={handleChange('issueDesc')} size="small" multiline rows={2} />
          <TextField label="质保开始日期" type="date" value={form.warrantyStartDate} onChange={handleChange('warrantyStartDate')} size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="质保结束日期" type="date" value={form.warrantyEndDate} onChange={handleChange('warrantyEndDate')} size="small" InputLabelProps={{ shrink: true }} />
          <Button variant="contained" onClick={async () => {
            if (!form.planId) return;
            try {
              await createAcceptance({
                planId: form.planId, acceptDate: form.acceptDate || undefined, result: form.result,
                issueDesc: form.issueDesc || undefined,
                warrantyStartDate: form.warrantyStartDate || undefined, warrantyEndDate: form.warrantyEndDate || undefined,
              });
              const err = useM15Store.getState().error;
              if (err) { onError(err); } else { onSuccess('验收创建成功'); setDrawerOpen(false); }
            } catch (e) { onError(e); }
          }} sx={{ backgroundColor: '#005591' }}>创建</Button>
        </div>
      </FormDrawer>
    </>
  );
}
