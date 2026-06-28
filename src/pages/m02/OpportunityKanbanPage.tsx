import { useEffect } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM02Store } from '@/stores/useM02Store';
import OpportunityCard from './components/OpportunityCard';
import type { Opportunity } from '@/types/m02';

const STAGES: { key: Opportunity['stage']; label: string; color: string }[] = [
  { key: 'initial', label: '潜在', color: '#9E9E9E' },
  { key: 'qualification', label: '资格确认', color: '#2271B3' },
  { key: 'proposal', label: '方案', color: '#005591' },
  { key: 'negotiation', label: '谈判', color: '#E65100' },
  { key: 'closed_won', label: '赢单', color: '#2E7D32' },
  { key: 'closed_lost', label: '输单', color: '#C62828' },
];

const STAGE_ORDER: Opportunity['stage'][] = ['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export default function OpportunityKanbanPage() {
  const { opportunities, loading, error, fetchOpportunities, updateOpportunity } = useM02Store();

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const handleMove = (opp: Opportunity, direction: 'forward' | 'backward') => {
    const idx = STAGE_ORDER.indexOf(opp.stage);
    const newIdx = direction === 'forward' ? idx + 1 : idx - 1;
    if (newIdx >= 0 && newIdx < STAGE_ORDER.length) {
      updateOpportunity(opp.id, { stage: STAGE_ORDER[newIdx] });
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="商机看板" subtitle="拖拽式商机阶段管理" />
      <Box sx={{ display: 'flex', gap: 1.5, overflow: 'auto', pb: 2 }}>
        {STAGES.map((stage) => {
          const items = opportunities.filter((o) => o.stage === stage.key);
          return (
            <Paper key={stage.key} variant="outlined" sx={{ minWidth: 240, width: 240, flexShrink: 0, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: `3px solid ${stage.color}`, backgroundColor: '#F5F5F5', borderRadius: '8px 8px 0 0' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: stage.color }}>{stage.label}</Typography>
                <Typography variant="caption" color="text.secondary">{items.length}个商机</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1, overflow: 'auto' }}>
                {items.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp}
                    onMoveForward={() => handleMove(opp, 'forward')}
                    onMoveBackward={() => handleMove(opp, 'backward')} />
                ))}
                {items.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>暂无商机</Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
