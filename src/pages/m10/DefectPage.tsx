import { useEffect, useMemo, useState } from 'react';
import { Box, Chip } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import { useM10Store } from '@/stores/useM10Store';
import type { Defect } from '@/types/m10';

const SEVERITY_COLOR: Record<string, 'info' | 'warning' | 'error'> = {
  minor: 'info',
  major: 'warning',
  critical: 'error',
};

const SEVERITY_LABEL: Record<string, string> = {
  minor: '轻微',
  major: '严重',
  critical: '致命',
};

const columns: Column<Defect>[] = [
  { id: 'qualityCheckId', label: '质检单ID', width: 130 },
  { id: 'type', label: '缺陷类型', sortable: true, width: 120 },
  { id: 'description', label: '描述', sortable: true },
  {
    id: 'severity', label: '严重程度', width: 110,
    render: (r) => (
      <Chip
        label={SEVERITY_LABEL[r.severity] ?? r.severity}
        color={SEVERITY_COLOR[r.severity] ?? 'default'}
        size="small"
        variant="outlined"
      />
    ),
  },
  { id: 'quantity', label: '数量', width: 80 },
  {
    id: 'resolved', label: '状态', width: 80,
    render: (r) => (
      <Chip
        label={r.resolved ? '已解决' : '未解决'}
        color={r.resolved ? 'success' : 'error'}
        size="small"
      />
    ),
  },
];

export default function DefectPage() {
  const { qualityChecks, loading, fetchQualityChecks } = useM10Store();
  const [keyword, setKeyword] = useState('');

  useEffect(() => { fetchQualityChecks(); }, [fetchQualityChecks]);

  const defects = useMemo(() => {
    const all: Defect[] = [];
    qualityChecks.forEach((qc) => {
      qc.defects.forEach((d) => {
        all.push({ ...d, qualityCheckId: qc.id });
      });
    });
    return all;
  }, [qualityChecks]);

  const filtered = keyword
    ? defects.filter((d) => d.type.includes(keyword) || d.description.includes(keyword))
    : defects;

  return (
    <Box>
      <PageHeader title="不良品管理" subtitle={`共 ${filtered.length} 条缺陷记录`} />
      <SearchBar placeholder="搜索缺陷类型/描述" value={keyword} onChange={setKeyword} />
      <DataTable<Defect>
        columns={columns}
        rows={filtered}
        rowKey="id"
        loading={loading}
        page={0}
        pageSize={20}
        total={filtered.length}
      />
    </Box>
  );
}
