import { List, ListItem, ListItemIcon, ListItemText, Typography, Chip, Box, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import type { Alert } from '@/types/m07';
import { formatDate } from '@/utils/format';
import { useM07Store } from '@/stores/useM07Store';

const ALERT_TYPE_LABELS: Record<string, string> = {
  deadline: '工期',
  cost: '成本',
  quality: '质量',
  resource: '资源',
  custom: '自定义',
};

const ALERT_LEVEL_ICONS: Record<string, React.ReactNode> = {
  critical: <ErrorIcon color="error" />,
  warning: <WarningAmberIcon color="warning" />,
  info: <InfoIcon color="info" />,
};

const ALERT_LEVEL_COLORS: Record<string, 'error' | 'warning' | 'info'> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
};

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  const { resolveAlert } = useM07Store();

  if (!alerts.length) {
    return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无预警信息</Typography>;
  }

  return (
    <List disablePadding>
      {alerts.map((a) => (
        <ListItem
          key={a.id}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: a.isRead ? 'transparent' : 'action.hover',
          }}
          secondaryAction={
            !a.resolvedAt && (
              <Button size="small" variant="outlined" color={ALERT_LEVEL_COLORS[a.level]} onClick={() => resolveAlert(a.id)}>
                处理
              </Button>
            )
          }
        >
          <ListItemIcon sx={{ minWidth: 36 }}>{ALERT_LEVEL_ICONS[a.level]}</ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight={a.isRead ? 400 : 600}>{a.title}</Typography>
                <Chip label={ALERT_TYPE_LABELS[a.type]} size="small" variant="outlined" />
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {a.content} · {formatDate(a.triggeredAt)}
                {a.resolvedAt && ` · 已处理: ${formatDate(a.resolvedAt)}`}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
