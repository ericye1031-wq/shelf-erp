import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM08Store } from '@/stores/useM08Store';
import type { AlternativeMaterial } from '@/types/m08';

const columns: Column<AlternativeMaterial>[] = [
  { id: 'originalItemId', label: '原物料ID', width: 140 },
  { id: 'partCode', label: '替代编码', sortable: true, width: 110 },
  { id: 'partName', label: '名称', width: 140 },
  { id: 'material', label: '材质', width: 80 },
  { id: 'spec', label: '规格', width: 120 },
  { id: 'priority', label: '优先级', width: 70, align: 'center', render: (r) => <Chip label={`P${r.priority}`} size="small" color={r.priority === 1 ? 'primary' : 'default'} /> },
  { id: 'priceDiff', label: '价差(¥)', width: 90, align: 'right', render: (r) => <span style={{ color: r.priceDiff > 0 ? '#e53935' : '#2e7d32' }}>{r.priceDiff > 0 ? '+' : ''}{r.priceDiff.toFixed(2)}</span> },
  { id: 'available', label: '可用', width: 60, align: 'center', render: (r) => <Chip label={r.available ? '是' : '否'} size="small" color={r.available ? 'success' : 'error'} /> },
];

import { Chip } from '@mui/material';

export default function AlternativeMaterialPage() {
  const { alternatives, loading, fetchAlternatives } = useM08Store();
  const [page, setPage] = useState(0);

  useEffect(() => { fetchAlternatives('default'); }, [fetchAlternatives]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="替代料管理" />
      <DataTable
        columns={columns}
        rows={alternatives}
        rowKey="id"
        page={page}
        pageSize={20}
        total={alternatives.length}
        onPageChange={setPage}
      />
    </Box>
  );
}
