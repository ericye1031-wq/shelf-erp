import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, Tabs, Tab, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM06Store } from '@/stores/useM06Store';
import { formatDate, formatMoney } from '@/utils/format';
import PaymentSchedule from './components/PaymentSchedule';
import InvoiceList from './components/InvoiceList';
import { useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', reviewing: '审核中', approved: '已审批',
  executing: '执行中', completed: '已完成', terminated: '已终止',
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentContract, payments, invoices, loading, fetchContractById, fetchPayments, fetchInvoices } = useM06Store();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchContractById(id);
      fetchPayments(id);
      fetchInvoices(id);
    }
  }, [id, fetchContractById, fetchPayments, fetchInvoices]);

  if (!currentContract) return <LoadingOverlay loading={loading} />;

  const c = currentContract;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title={c.code}
        subtitle={c.title}
        action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m06/contracts')}>返回列表</Button>}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">客户</Typography><Typography fontWeight={600}>{c.customerName}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">合同金额</Typography><Typography fontWeight={600} color="#005591">{formatMoney(c.amount)}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">签订日期</Typography><Typography fontWeight={600}>{(c.signDate) ? formatDate(c.signDate) : "-"}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">交货日期</Typography><Typography fontWeight={600}>{(c.deliveryDate) ? formatDate(c.deliveryDate) : "-"}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">状态</Typography><StatusBadge status={c.status} label={STATUS_LABELS[c.status]} /></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">付款条款</Typography><Typography fontWeight={600}>{c.paymentTerms}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="回款计划" />
        <Tab label="发票信息" />
      </Tabs>

      {tab === 0 && <PaymentSchedule payments={payments} />}
      {tab === 1 && <InvoiceList invoices={invoices} />}
    </Box>
  );
}
