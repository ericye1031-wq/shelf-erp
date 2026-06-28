import { Chip } from '@mui/material';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'small' | 'medium';
}

/** 状态颜色映射 — RAL配色 */
const STATUS_COLOR_MAP: Record<string, { bg: string; color: string }> = {
  // 通用状态
  draft: { bg: '#F5F5F5', color: '#666666' },
  active: { bg: '#E3F2FD', color: '#005591' },
  completed: { bg: '#E8F5E9', color: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
  // 合同状态
  reviewing: { bg: '#FFF3E0', color: '#E65100' },
  approved: { bg: '#E3F2FD', color: '#005591' },
  executing: { bg: '#E3F2FD', color: '#2271B3' },
  terminated: { bg: '#FFEBEE', color: '#C62828' },
  // 项目状态
  planning: { bg: '#F3E5F5', color: '#6A1B9A' },
  in_progress: { bg: '#E3F2FD', color: '#005591' },
  paused: { bg: '#FFF3E0', color: '#E65100' },
  // 回款状态
  pending: { bg: '#F5F5F5', color: '#666666' },
  partial: { bg: '#FFF3E0', color: '#E65100' },
  paid: { bg: '#E8F5E9', color: '#2E7D32' },
  overdue: { bg: '#FFEBEE', color: '#F44611' },
  // 预警级别
  info: { bg: '#E3F2FD', color: '#2271B3' },
  warning: { bg: '#FFF3E0', color: '#E65100' },
  critical: { bg: '#FFEBEE', color: '#F44611' },
  // 设备状态
  running: { bg: '#E8F5E9', color: '#2E7D32' },
  idle: { bg: '#F5F5F5', color: '#666666' },
  maintenance: { bg: '#FFF3E0', color: '#E65100' },
  breakdown: { bg: '#FFEBEE', color: '#C62828' },
};

/** 状态标签 */
export default function StatusBadge({ status, label, size = 'small' }: StatusBadgeProps) {
  const colors = STATUS_COLOR_MAP[status] ?? { bg: '#F5F5F5', color: '#666666' };

  return (
    <Chip
      label={label ?? status}
      size={size}
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        '& .MuiChip-label': { px: 1.2 },
      }}
    />
  );
}
