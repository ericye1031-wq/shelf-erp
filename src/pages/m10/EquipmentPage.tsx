import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { Equipment } from '@/types/m10';
import { formatDate } from '@/utils/format';

const EQ_STATUS: Record<string, string> = { running: '运行中', idle: '空闲', maintenance: '保养中', breakdown: '故障' };

const columns: Column<Equipment>[] = [
  { id: 'code', label: '设备编码', sortable: true, width: 110 },
  { id: 'name', label: '名称', width: 140 },
  { id: 'type', label: '类型', width: 100 },
  { id: 'workshop', label: '车间', width: 100 },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={EQ_STATUS[r.status] || r.status} /> },
  { id: 'capacity', label: '产能', width: 70, align: 'right' },
  { id: 'currentLoad', label: '当前负荷', width: 80, align: 'right', render: (r) => `${r.currentLoad}%` },
  { id: 'nextMaintenance', label: '下次保养', width: 100, render: (r) => (r.nextMaintenance) ? formatDate(r.nextMaintenance) : "-" },
];

export default function EquipmentPage() {
  const { equipment, loading, fetchEquipment } = useM10Store();
  const [page, setPage] = useState(0);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="设备台账" />
      <DataTable columns={columns} rows={equipment} rowKey="id" loading={loading} page={page} pageSize={20} total={equipment.length} onPageChange={setPage} />
    </Box>
  );
}
