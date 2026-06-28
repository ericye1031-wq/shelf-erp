import { useState, useEffect } from 'react';
import { Box, Button, Alert } from '@mui/material';import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM02Store } from '@/stores/useM02Store';
import FollowupTimeline from './components/FollowupTimeline';
import FormDrawer from '@/components/common/FormDrawer';
import { TextField, MenuItem, Stack } from '@mui/material';

const FOLLOWUP_TYPES = [
  { value: 'call', label: '电话' },
  { value: 'visit', label: '拜访' },
  { value: 'email', label: '邮件' },
  { value: 'wechat', label: '微信' },
  { value: 'other', label: '其他' },
];

export default function FollowupPage() {
  const { followups, loading, error, fetchFollowups, createFollowup } = useM02Store();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { fetchFollowups(); }, [fetchFollowups]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="跟进记录" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)}
          sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          新增跟进
        </Button>
      } />
      <FollowupTimeline items={followups} />
      <FormDrawer open={drawerOpen} title="新增跟进记录" onCancel={() => setDrawerOpen(false)}
        onSubmit={() => { createFollowup({ customerId: '', opportunityId: null, type: 'call', content: '', nextAction: '', nextDate: '', createdBy: 'admin', createdAt: new Date().toISOString() }); setDrawerOpen(false); }}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="客户" size="small" fullWidth required />
          <TextField label="跟进方式" size="small" fullWidth select defaultValue="call">
            {FOLLOWUP_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField label="跟进内容" size="small" fullWidth multiline rows={3} required />
          <TextField label="下一步行动" size="small" fullWidth />
          <TextField label="下次跟进日期" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} />
        </Stack>
      </FormDrawer>
    </Box>
  );
}
