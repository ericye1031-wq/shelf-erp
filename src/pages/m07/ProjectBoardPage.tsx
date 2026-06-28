import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, Tabs, Tab, Typography, Button, LinearProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM07Store } from '@/stores/useM07Store';
import { formatDate } from '@/utils/format';
import MilestoneCard from './components/MilestoneCard';
import CostDeviation from './components/CostDeviation';
import AlertList from './components/AlertList';

const STATUS_LABELS: Record<string, string> = {
  planning: '规划中', in_progress: '进行中', paused: '已暂停', completed: '已完成', cancelled: '已取消',
};

const PHASES = ['询价', '报价', '合同', 'BOM', '生产', '发货', '安装'];

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, milestones, alerts, loading, fetchProjectById, fetchMilestones, fetchAlerts } = useM07Store();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) { fetchProjectById(id); fetchMilestones(id); }
    fetchAlerts();
  }, [id, fetchProjectById, fetchMilestones, fetchAlerts]);

  if (!currentProject) return <LoadingOverlay loading={loading} />;

  const p = currentProject;
  const currentPhaseIdx = Math.min(Math.floor(p.progress / (100 / PHASES.length)), PHASES.length - 1);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title={p.name} subtitle={p.code} action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m07/projects')}>返回列表</Button>} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">客户</Typography><Typography fontWeight={600}>{p.customerName}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">经理</Typography><Typography fontWeight={600}>{p.managerName}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">状态</Typography><StatusBadge status={p.status} label={STATUS_LABELS[p.status]} /></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">工期</Typography><Typography fontWeight={600}>{(p.startDate) ? formatDate(p.startDate) : "-"} ~ {(p.endDate) ? formatDate(p.endDate) : "-"}</Typography></Grid>
          </Grid>
          {/* 阶段里程碑进度条 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {PHASES.map((phase, idx) => (
              <Box key={phase} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: idx <= currentPhaseIdx ? '#005591' : '#999', fontWeight: idx <= currentPhaseIdx ? 700 : 400 }}>{phase}</Typography>
                <LinearProgress variant="determinate" value={idx <= currentPhaseIdx ? 100 : 0} sx={{ mt: 0.5, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0', '& .MuiLinearProgress-bar': { backgroundColor: idx <= currentPhaseIdx ? '#005591' : '#E0E0E0' } }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="里程碑" />
        <Tab label="成本偏差" />
        <Tab label="预警" />
      </Tabs>

      {tab === 0 && <MilestoneCard milestones={milestones} />}
      {tab === 1 && <CostDeviation />}
      {tab === 2 && <AlertList alerts={alerts.filter((a) => a.projectId === id)} />}
    </Box>
  );
}
