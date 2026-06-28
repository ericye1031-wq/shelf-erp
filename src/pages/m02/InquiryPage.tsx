import { useState, useEffect } from 'react';
import { Box, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM02Store } from '@/stores/useM02Store';
import { BIZ_STATUS_MAP } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import InquiryForm from './components/InquiryForm';
import type { Inquiry } from '@/types/m02';

const columns: Column<Inquiry>[] = [
  { id: 'code', label: '询价单号', sortable: true, width: 140 },
  { id: 'customerName', label: '客户', width: 160 },
  { id: 'shelfType', label: '货架类型', width: 120 },
  { id: 'quantity', label: '数量', width: 80, align: 'right' },
  { id: 'deliveryDate', label: '交期', width: 110, render: (r) => (r.deliveryDate) ? formatDate(r.deliveryDate) : "-" },
  { id: 'status', label: '状态', width: 90, render: (r) => <StatusBadge status={r.status} label={BIZ_STATUS_MAP[r.status]} /> },
];

export default function InquiryPage() {
  const { inquiries, loading, error, fetchInquiries } = useM02Store();
  const [keyword, setKeyword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const filtered = inquiries.filter((i) =>
    (i.code || '').includes(keyword) || (i.customerName || '').includes(keyword) || (i.shelfType || '').includes(keyword)
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="询价管理" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)}
          sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          新增询价
        </Button>
      } />
      <SearchBar placeholder="搜索单号/客户/货架类型" value={keyword} onChange={setKeyword} />
      <DataTable columns={columns} rows={filtered} />
      <InquiryForm open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}
