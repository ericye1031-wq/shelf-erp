import { Card, CardContent, Typography, Grid, LinearProgress, Box, Chip } from '@mui/material';
import type { Milestone } from '@/types/m07';
import { formatDate } from '@/utils/format';

const STATUS_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  pending: { label: '待开始', color: 'default' },
  in_progress: { label: '进行中', color: 'primary' },
  completed: { label: '已完成', color: 'success' },
  overdue: { label: '已超期', color: 'error' },
};

export default function MilestoneCard({ milestones }: { milestones: Milestone[] }) {
  if (!milestones.length) {
    return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无里程碑数据</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {milestones.map((m) => {
        const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
        return (
          <Grid item xs={12} sm={6} md={4} key={m.id}>
            <Card sx={{ borderLeft: 4, borderColor: cfg.color === 'error' ? 'error.main' : cfg.color === 'success' ? 'success.main' : 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{m.name}</Typography>
                  <Chip label={cfg.label} color={cfg.color} size="small" />
                </Box>
                {m.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{m.description}</Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">计划: {(m.plannedDate) ? formatDate(m.plannedDate) : "-"}</Typography>
                  {m.actualDate && <Typography variant="caption" color="text.secondary">实际: {(m.actualDate) ? formatDate(m.actualDate) : "-"}</Typography>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress variant="determinate" value={m.progress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                  <Typography variant="caption" fontWeight={600}>{m.progress}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
