import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM09Store } from '@/stores/useM09Store';
import { formatDate, formatMoney } from '@/utils/format';
import type { PurchaseOrder } from '@/types/m09';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', approved: '已审批',
  ordered: '已下单', partial_received: '部分到货', received: '已到货', cancelled: '已取消',
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, loading, fetchOrderById, fetchItems } = useM09Store();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
      fetchItems(id);
    }
  }, [id, fetchOrderById, fetchItems]);

  if (!currentOrder) return <LoadingOverlay loading={loading} />;

  const o = currentOrder;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title={o.code}
        subtitle={`供应商：${o.supplierName || '-'}`}
        action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m09/orders')}>返回列表</Button>}
      />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">供应商</Typography><Typography fontWeight={600}>{o.supplierName || '-'}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">联系人</Typography><Typography fontWeight={600}>{o.contactName || '-'}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">联系电话</Typography><Typography fontWeight={600}>{o.contactPhone || '-'}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">金额</Typography><Typography fontWeight={600} color="#005591">{formatMoney(o.amount)}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">订购日期</Typography><Typography fontWeight={600}>{(o.orderDate) ? formatDate(o.orderDate) : "-"}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">预计到货</Typography><Typography fontWeight={600}>{(o.expectedDate) ? formatDate(o.expectedDate) : "-"}</Typography></Grid>
            <Grid item xs={3}><Typography variant="body2" color="text.secondary">状态</Typography><Typography fontWeight={600}>{STATUS_LABELS[o.status]}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
