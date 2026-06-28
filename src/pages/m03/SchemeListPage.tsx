import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Button, Chip } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM03Store } from '@/stores/useM03Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Scheme } from '@/types/m03';

const statusLabel: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  approved: '已批准',
  rejected: '已驳回',
};

const columns: Column<Scheme>[] = [
  { id: 'code', label: '方案编号', sortable: true, width: 140 },
  { id: 'name', label: '方案名称', minWidth: 180 },
  { id: 'customerId', label: '客户ID', width: 140, hide: true },
  { id: 'projectId', label: '项目ID', width: 140, hide: true },
  { id: 'rackType', label: '货架类型', width: 120 },
  { id: 'currentVersion', label: '当前版本', width: 90, align: 'center' },
  {
    id: 'status',
    label: '状态',
    width: 90,
    render: (r) => (
      <StatusBadge
        status={r.status}
        label={statusLabel[r.status] || r.status}
      />
    ),
  },
  {
    id: 'createdAt',
    label: '创建时间',
    width: 160,
    render: (r) => new Date(r.createdAt).toLocaleString(),
  },
];

export default function SchemeListPage() {
  const navigate = useNavigate();
  const { schemes, loading, error, fetchSchemes, removeScheme } = useM03Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader
        title="方案管理"
        action={
          <Button
            variant="contained"
            onClick={() => navigate('/m03/schemes/new')}
          >
            新建方案
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={schemes}
        rowKey="id"
        loading={loading}
        page={page}
        pageSize={20}
        total={schemes.length}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/m03/schemes/${(row as Scheme).id}`)}
        actions={[
          {
            label: '查看',
            onClick: (row) => navigate(`/m03/schemes/${(row as Scheme).id}`),
          },
          {
            label: '编辑',
            onClick: async (row) => {
              const s = row as Scheme;
              if (s.status === 'draft') {
                navigate(`/m03/schemes/${s.id}/edit`);
              } else {
                onError('只有草稿状态才能编辑');
              }
            },
          },
          {
            label: '删除',
            onClick: async (row) => {
              const s = row as Scheme;
              if (s.status !== 'draft') {
                onError('只有草稿状态才能删除');
                return;
              }
              useM03Store.setState({ error: null });
              await removeScheme(s.id);
              const err = useM03Store.getState().error;
              if (err) { onError(err); } else { onSuccess('方案删除成功'); }
            },
            color: 'error',
          },
        ]}
      />
    </Box>
  );
}
