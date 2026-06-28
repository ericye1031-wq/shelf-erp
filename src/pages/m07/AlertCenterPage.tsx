import { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import { useM07Store } from '@/stores/useM07Store';
import { formatDate } from '@/utils/format';
import type { Alert } from '@/types/m07';

const LEVEL_COLORS: Record<string, string> = { critical: '#F44611', warning: '#FF9800', info: '#2271B3' };
const LEVEL_LABELS: Record<string, string> = { critical: '严重', warning: '警告', info: '提示' };
const TYPE_LABELS: Record<string, string> = { deadline: '工期', cost: '成本', quality: '质量', resource: '资源', custom: '自定义' };

const columns: Column<Alert>[] = [
  { id: 'level', label: '级别', width: 80, render: (r) => <Chip label={LEVEL_LABELS[r.level]} size="small" sx={{ backgroundColor: `${LEVEL_COLORS[r.level]}20`, color: LEVEL_COLORS[r.level], fontWeight: 600 }} /> },
  { id: 'type', label: '类型', width: 80, render: (r) => TYPE_LABELS[r.type] ?? r.type },
  { id: 'title', label: '标题' },
  { id: 'content', label: '内容', render: (r) => <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</Box> },
  { id: 'triggeredAt', label: '触发时间', width: 140, render: (r) => formatDate(r.triggeredAt) },
  { id: 'isRead', label: '状态', width: 80, render: (r) => r.isRead ? '已读' : <Box component="span" sx={{ color: '#F44611', fontWeight: 600 }}>未读</Box> },
];

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '严重', value: 'critical' },
  { label: '警告', value: 'warning' },
  { label: '提示', value: 'info' },
];

export default function AlertCenterPage() {
  const { alerts, loading, fetchAlerts } = useM07Store();
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.level === filter);

  return (
    <>
      <PageHeader title="预警中心" subtitle={`${alerts.filter((a) => !a.isRead).length} 条未读`} />
      <SearchBar
        placeholder="搜索预警"
        filterSlot={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {FILTER_OPTIONS.map((opt) => (
              <Chip key={opt.value} label={opt.label} size="small" variant={filter === opt.value ? 'filled' : 'outlined'}
                onClick={() => setFilter(opt.value)}
                sx={filter === opt.value ? { backgroundColor: '#005591', color: '#fff' } : { borderColor: '#ccc' }}
              />
            ))}
          </Box>
        }
      />
      <DataTable<Alert> columns={columns} rows={filtered} rowKey="id" loading={loading} page={0} pageSize={20} total={filtered.length} />
    </>
  );
}
