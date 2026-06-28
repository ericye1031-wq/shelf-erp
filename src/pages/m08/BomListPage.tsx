import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM08Store } from '@/stores/useM08Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { BOM } from '@/types/m08';

const columns: Column<BOM>[] = [
  { id: 'id', label: 'BOM编号', sortable: true, width: 140 },
  { id: 'projectId', label: '项目编号', width: 140 },
  { id: 'version', label: '版本', width: 60, align: 'center' },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={r.status === 'released' ? '生效' : r.status === 'draft' ? '草稿' : '归档'} /> },
  { id: 'totalWeight', label: '总重量(kg)', width: 100, align: 'right', render: (r) => r.totalWeight.toFixed(1) },
  { id: 'totalCost', label: '总成本(¥)', width: 110, align: 'right', render: (r) => r.totalCost.toFixed(2) },
];

export default function BomListPage() {
  const navigate = useNavigate();
  const { boms, loading, error, fetchBoms, removeBom } = useM08Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [page, setPage] = useState(0);

  useEffect(() => { fetchBoms(); }, [fetchBoms]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="BOM管理" />
      <DataTable
        columns={columns}
        rows={boms}
        rowKey="id"
        loading={loading}
        page={page}
        pageSize={20}
        total={boms.length}
        onPageChange={setPage}
        actions={[
          { label: '查看', onClick: (row) => navigate(`/m08/bom/${(row as BOM).id}`) },
          { label: '版本', onClick: (row) => navigate(`/m08/bom-versions?bomId=${(row as BOM).id}`) },
          { label: '删除', onClick: async (row) => {
            useM08Store.setState({ error: null });
            await removeBom((row as BOM).id);
            const err = useM08Store.getState().error;
            if (err) { onError(err); } else { onSuccess('BOM删除成功'); }
          }, color: 'error' },
        ]}
      />
    </Box>
  );
}
