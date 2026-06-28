import { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { useM06Store } from '@/stores/useM06Store';
import { formatMoney, formatDate } from '@/utils/format';

interface PaymentSummary {
  id: string;
  code: string;
  customerName: string | null;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  nextDate: string | null;
  status: string;
}

const STATUS_LABELS: Record<string, string> = { pending: '待回款', partial: '部分回款', paid: '已完成', overdue: '逾期' };

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '逾期', value: 'overdue' },
  { label: '待回款', value: 'pending' },
  { label: '已完成', value: 'paid' },
];

const columns: Column<PaymentSummary>[] = [
  { id: 'code', label: '合同编号', sortable: true, width: 140 },
  { id: 'customerName', label: '客户', sortable: true, width: 140 },
  { id: 'totalAmount', label: '总金额', align: 'right', width: 130, render: (r) => formatMoney(r.totalAmount) },
  { id: 'paidAmount', label: '已回款', align: 'right', width: 130, render: (r) => formatMoney(r.paidAmount) },
  { id: 'unpaidAmount', label: '未回款', align: 'right', width: 130, render: (r) => <Box component="span" sx={{ color: r.unpaidAmount > 0 ? '#F44611' : 'inherit' }}>{formatMoney(r.unpaidAmount)}</Box> },
  { id: 'nextDate', label: '下次回款日期', width: 120, render: (r) => r.nextDate ? formatDate(r.nextDate) : '-' },
  { id: 'status', label: '状态', width: 100, render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status]} /> },
];

export default function PaymentTrackPage() {
  const { contracts, loading, fetchContracts } = useM06Store();
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const summaries: PaymentSummary[] = contracts.map((c) => ({
    id: c.id,
    code: c.code,
    customerName: c.customerName,
    totalAmount: c.amount,
    paidAmount: c.amount * 0.6,
    unpaidAmount: c.amount * 0.4,
    nextDate: c.deliveryDate,
    status: c.status === 'completed' ? 'paid' : c.status === 'executing' ? 'partial' : 'pending',
  }));

  const filtered = filter === 'all' ? summaries : summaries.filter((s) => s.status === filter);

  return (
    <>
      <PageHeader title="回款跟踪" subtitle={`共 ${filtered.length} 条记录`} />
      <SearchBar
        placeholder="搜索合同"
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
      <DataTable<PaymentSummary>
        columns={columns}
        rows={filtered}
        rowKey="id"
        loading={loading}
        page={0}
        pageSize={20}
        total={filtered.length}
      />
    </>
  );
}
