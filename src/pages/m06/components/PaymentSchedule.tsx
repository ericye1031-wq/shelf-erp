import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import StatusBadge from '@/components/common/StatusBadge';
import { formatMoney, formatDate } from '@/utils/format';
import type { PaymentPlan } from '@/types/m06';

const STATUS_LABELS: Record<string, string> = { pending: '待回款', partial: '部分回款', paid: '已回款', overdue: '逾期' };

interface PaymentScheduleProps {
  payments: PaymentPlan[];
}

export default function PaymentSchedule({ payments }: PaymentScheduleProps) {
  if (payments.length === 0) {
    return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无回款计划</Typography>;
  }

  return (
    <Stack spacing={2}>
      {payments.map((p) => (
        <Box key={p.id} sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography fontWeight={600}>{p.stage}</Typography>
            <StatusBadge status={p.status} label={STATUS_LABELS[p.status]} />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">计划金额: <Box component="span" fontWeight={600} color="#005591">{formatMoney(p.amount)}</Box></Typography>
            <Typography variant="body2" color="text.secondary">比例: {p.ratio}%</Typography>
            <Typography variant="body2" color="text.secondary">计划日期: {(p.plannedDate) ? formatDate(p.plannedDate) : "-"}</Typography>
            {p.actualDate && <Typography variant="body2" color="text.secondary">实际日期: {(p.actualDate) ? formatDate(p.actualDate) : "-"}</Typography>}
          </Box>
          <LinearProgress
            variant="determinate"
            value={p.status === 'paid' ? 100 : p.status === 'partial' ? 50 : 0}
            sx={{ height: 6, borderRadius: 3, backgroundColor: '#E0E0E0', '& .MuiLinearProgress-bar': { backgroundColor: p.status === 'overdue' ? '#F44611' : p.status === 'paid' ? '#4CAF50' : '#005591' } }}
          />
        </Box>
      ))}
    </Stack>
  );
}
