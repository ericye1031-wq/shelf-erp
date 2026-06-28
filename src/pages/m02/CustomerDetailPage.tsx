import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Tabs, Tab, Stack, Chip, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM02Store } from '@/stores/useM02Store';
import StatusBadge from '@/components/common/StatusBadge';
import type { Contact, Opportunity, Inquiry, FollowUp } from '@/types/m02';

const CUSTOMER_TYPES: Record<string, string> = { direct: '直客', agent: '代理商', distributor: '经销商' };

const contactCols: Column<Contact>[] = [
  { id: 'name', label: '姓名', width: 100 },
  { id: 'position', label: '职位', width: 120 },
  { id: 'phone', label: '手机', width: 130 },
  { id: 'email', label: '邮箱', width: 200 },
  { id: 'isPrimary', label: '主联系人', width: 80, align: 'center', render: (r) => r.isPrimary ? '★' : '' },
];

const oppCols: Column<Opportunity>[] = [
  { id: 'title', label: '商机名称', width: 200 },
  { id: 'amount', label: '金额', width: 120, align: 'right', render: (r) => r.amount ? `¥${Number(r.amount).toLocaleString()}` : '-' },
  { id: 'stage', label: '阶段', width: 120 },
  { id: 'probability', label: '概率', width: 80, align: 'center', render: (r) => `${r.probability}%` },
];

const inqCols: Column<Inquiry>[] = [
  { id: 'code', label: '询价单号', width: 140 },
  { id: 'shelfType', label: '货架类型', width: 140 },
  { id: 'quantity', label: '数量', width: 80, align: 'right' },
  { id: 'deliveryDate', label: '交期', width: 110, render: (r) => r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : '-' },
  { id: 'status', label: '状态', width: 90 },
];

const followCols: Column<FollowUp>[] = [
  { id: 'type', label: '类型', width: 80 },
  { id: 'content', label: '内容', width: 300 },
  { id: 'nextAction', label: '下一步', width: 200 },
  { id: 'createdAt', label: '时间', width: 120, render: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCustomer, contacts, opportunities, inquiries, followups, loading, error, fetchCustomerById, fetchContacts, fetchOpportunities, fetchInquiries, fetchFollowups } = useM02Store();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
      fetchContacts(id);
    }
  }, [id, fetchCustomerById, fetchContacts]);

  useEffect(() => {
    fetchOpportunities();
    fetchInquiries();
    fetchFollowups();
  }, [fetchOpportunities, fetchInquiries, fetchFollowups]);

  const c = currentCustomer;
  if (!c) return loading ? <LoadingOverlay loading /> : <Typography sx={{ p: 4 }}>客户不存在</Typography>;

  const custOpps = opportunities.filter((o) => o.customerId === id);
  const custInqs = inquiries.filter((i) => i.customerId === id);
  const custFollows = followups.filter((f) => f.customerId === id);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title={c.name} subtitle={`${c.code} · ${c.industry || '未知行业'}`}
        action={<IconButton onClick={() => navigate('/m02/customers')}><ArrowBackIcon /></IconButton>} />
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
          <Typography variant="body2"><strong>等级：</strong><Chip label={c.level} size="small" color="primary" variant="outlined" /></Typography>
          <Typography variant="body2"><strong>类型：</strong>{CUSTOMER_TYPES[c.type] || c.type}</Typography>
          <Typography variant="body2"><strong>区域：</strong>{c.region || '-'}</Typography>
          <Typography variant="body2"><strong>来源：</strong>{c.source || '-'}</Typography>
          <StatusBadge status={c.status} label={c.status === 'active' ? '活跃' : c.status === 'inactive' ? '停用' : '草稿'} />
        </Stack>
      </Paper>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #E0E0E0', mb: 2 }}>
        <Tab label={`联系人 (${contacts.length})`} />
        <Tab label={`商机 (${custOpps.length})`} />
        <Tab label={`询价 (${custInqs.length})`} />
        <Tab label={`跟进 (${custFollows.length})`} />
      </Tabs>
      {tab === 0 && <DataTable columns={contactCols} rows={contacts} rowKey="id" />}
      {tab === 1 && <DataTable columns={oppCols} rows={custOpps} rowKey="id" />}
      {tab === 2 && <DataTable columns={inqCols} rows={custInqs} rowKey="id" />}
      {tab === 3 && <DataTable columns={followCols} rows={custFollows} rowKey="id" />}
    </Box>
  );
}
