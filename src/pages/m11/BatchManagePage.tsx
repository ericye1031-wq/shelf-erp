import { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM11Store } from '@/stores/useM11Store';
import { formatDate } from '@/utils/format';

const BATCH_STATUS: Record<string, string> = { in_inspection: '待检', qualified: '合格', unqualified: '不合格', frozen: '冻结' };
const BATCH_COLORS: Record<string, 'default' | 'success' | 'error' | 'warning'> = { in_inspection: 'warning', qualified: 'success', unqualified: 'error', frozen: 'default' };

export default function BatchManagePage() {
  const { batches, loading, fetchBatches } = useM11Store();

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="批次管理" />
      {!batches.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无批次数据</Typography>
      ) : (
        <Grid container spacing={2}>
          {batches.map((b) => (
            <Grid item xs={12} md={6} key={b.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{b.code}</Typography>
                    <Chip label={BATCH_STATUS[b.status]} color={BATCH_COLORS[b.status]} size="small" />
                  </Box>
                  <Typography variant="body2">{b.material} {b.spec}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    库存: {b.remainingQty}/{b.quantity} {b.unit} | 库位: {b.locationCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">生产日期: {formatDate(b.productionDate)}{b.expiryDate ? ` | 有效期: ${formatDate(b.expiryDate)}` : ''}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
