import { Card, CardContent, Typography, Stack, IconButton, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Opportunity } from '@/types/m02';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onMoveForward: () => void;
  onMoveBackward: () => void;
}

export default function OpportunityCard({ opportunity, onMoveForward, onMoveBackward }: OpportunityCardProps) {
  const opp = opportunity;

  return (
    <Card variant="outlined" sx={{ mb: 1, borderRadius: 2, cursor: 'pointer',
      '&:hover': { boxShadow: '0 2px 8px rgba(0,85,145,0.12)', borderColor: '#2271B3' } }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" fontWeight={700} color="#005591" sx={{ mb: 0.5 }}>{opp.title}</Typography>
        <Typography variant="caption" color="text.secondary">{opp.customerName}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Chip label={`¥${((opp.amount ?? 0) / 10000).toFixed(1)}万`} size="small" variant="outlined"
            sx={{ fontSize: '0.7rem', color: '#2271B3', borderColor: '#2271B3' }} />
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={onMoveBackward} sx={{ color: '#999' }}>
              <ArrowBackIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton size="small" onClick={onMoveForward} sx={{ color: '#005591' }}>
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Stack>
        {opp.expectedDate && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            预计：{opp.expectedDate}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
