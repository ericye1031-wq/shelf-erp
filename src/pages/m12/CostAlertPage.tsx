import { useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Chip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM12Store } from '@/stores/useM12Store';
import { formatDate } from '@/utils/format';

const LEVEL_ICONS: Record<string, React.ReactNode> = { critical: <ErrorIcon color="error" />, warning: <WarningAmberIcon color="warning" />, info: <InfoIcon color="info" /> };
const TYPE_LABELS: Record<string, string> = { over_budget: '超预算', approaching_budget: '接近预算', unusual_spending: '异常支出' };

export default function CostAlertPage() {
  const { alerts, loading, fetchAlerts } = useM12Store();

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="成本预警" />
      {!alerts.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无预警信息</Typography>
      ) : (
        <List disablePadding>
          {alerts.map((a) => (
            <ListItem key={a.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: a.isRead ? 'transparent' : 'action.hover' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>{LEVEL_ICONS[a.level]}</ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={a.isRead ? 400 : 600}>{a.message}</Typography>
                    <Chip label={TYPE_LABELS[a.type]} size="small" variant="outlined" />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    阈值: {a.threshold} | 实际: {a.actualValue} | {formatDate(a.triggeredAt)}
                    {a.resolvedAt && ` · 已处理: ${formatDate(a.resolvedAt)}`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
