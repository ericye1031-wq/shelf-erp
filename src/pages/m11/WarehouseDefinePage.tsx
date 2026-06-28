import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM11Store } from '@/stores/useM11Store';
import type { Warehouse } from '@/types/m11';

const columns: Column<Warehouse>[] = [
  { id: 'code', label: '编码', sortable: true, width: 100 },
  { id: 'name', label: '名称', width: 140 },
  { id: 'type', label: '类型', width: 90 },
  { id: 'managerName', label: '负责人', width: 80 },
  { id: 'address', label: '地址', width: 200 },
  { id: 'status', label: '状态', width: 70, render: (r) => <StatusBadge status={r.status} label={r.status === 'active' ? '启用' : '停用'} /> },
];

export default function WarehouseDefinePage() {
  const { warehouses, loading, fetchWarehouses } = useM11Store();
  const [page, setPage] = useState(0);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="仓库定义" />
      <DataTable columns={columns} rows={warehouses} rowKey="id" loading={loading} page={page} pageSize={20} total={warehouses.length} onPageChange={setPage} />
    </Box>
  );
}
