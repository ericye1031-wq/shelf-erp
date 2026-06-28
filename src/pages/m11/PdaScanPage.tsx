import { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM11Store } from '@/stores/useM11Store';
import { formatDate } from '@/utils/format';

const OPERATION_LABELS: Record<string, string> = { inbound: '入库', outbound: '出库', transfer: '移库', check: '盘点', freeze: '冻结', unfreeze: '解冻' };

export default function PdaScanPage() {
  const { pdaOperations, loading, fetchPdaOperations } = useM11Store();

  useEffect(() => { fetchPdaOperations(); }, [fetchPdaOperations]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="PDA扫码记录" />
      {!pdaOperations.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无操作记录</Typography>
      ) : (
        <Grid container spacing={2}>
          {pdaOperations.map((op) => (
            <Grid item xs={12} md={6} key={op.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={OPERATION_LABELS[op.type] || op.type} color="primary" size="small" />
                    <Typography variant="caption" color="text.secondary">{formatDate(op.operatedAt)}</Typography>
                  </Box>
                  <Typography variant="body2">{op.material} {op.spec} × {op.quantity} {op.unit}</Typography>
                  <Typography variant="caption" color="text.secondary">操作人: {op.operatorName} | 库位: {op.locationId}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
