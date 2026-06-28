import { Box, Typography } from '@mui/material';
import Timeline from '@/components/shared/Timeline';
import type { FollowUp } from '@/types/m02';

const TYPE_LABELS: Record<string, string> = { call: '电话', visit: '拜访', email: '邮件', wechat: '微信', other: '其他' };
const TYPE_COLORS: Record<string, string> = { call: '#005591', visit: '#2E7D32', email: '#2271B3', wechat: '#4CAF50', other: '#9E9E9E' };

interface FollowupTimelineProps {
  items: FollowUp[];
}

export default function FollowupTimeline({ items }: FollowupTimelineProps) {
  if (items.length === 0) {
    return <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>暂无跟进记录</Typography>;
  }

  const timelineItems = items.map((f) => ({
    title: `${TYPE_LABELS[f.type] ?? f.type}跟进`,
    time: f.createdAt ? new Date(f.createdAt).toLocaleString('zh-CN') : '',
    description: f.content,
    color: TYPE_COLORS[f.type] ?? '#005591',
  }));

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Timeline items={timelineItems} />
    </Box>
  );
}
