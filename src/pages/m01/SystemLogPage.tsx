import { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Alert } from '@mui/material';import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM01Store } from '@/stores/useM01Store';
import { formatDate } from '@/utils/format';
import type { SystemLog } from '@/types/m01';

const columns: Column<SystemLog>[] = [
  { id: 'createdAt', label: '时间', width: 170, sortable: true, render: (r) => formatDate(r.createdAt, 'YYYY-MM-DD HH:mm') },
  { id: 'userName', label: '用户', width: 100, sortable: true },
  { id: 'module', label: '模块', width: 120 },
  { id: 'action', label: '操作', width: 140 },
  { id: 'ip', label: 'IP地址', width: 130 },
  { id: 'detail', label: '详情' },
];

export default function SystemLogPage() {
  const { logs, loading, error, fetchLogs } = useM01Store();
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const modules = [...new Set(logs.map((l) => l.module))];
  const filtered = logs.filter((l) => {
    const matchKey = !keyword || l.userName.includes(keyword) || l.action.includes(keyword);
    const matchMod = !moduleFilter || l.module === moduleFilter;
    return matchKey && matchMod;
  });

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="系统日志" subtitle="查看系统操作日志（只读）" />
      <SearchBar placeholder="搜索用户/操作" value={keyword} onChange={setKeyword}
        filterSlot={
          <TextField select size="small" label="模块" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}
            sx={{ minWidth: 140 }}>
            <MenuItem value="">全部</MenuItem>
            {modules.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        }
      />
      <DataTable columns={columns} rows={filtered} />
    </Box>
  );
}
