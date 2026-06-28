import { useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Grid } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';

export default function ProductionProgressPage() {
  const { workOrders, loading, fetchWorkOrders } = useM10Store();

  useEffect(() => { fetchWorkOrders(); }, [fetchWorkOrders]);

  const inProgress = workOrders.filter((w) => w.status === 'in_progress' || w.status === 'released');

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="生产进度" />
      {!inProgress.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>当前无进行中的工单</Typography>
      ) : (
        <Grid container spacing={2}>
          {inProgress.map((wo) => (
            <Grid item xs={12} key={wo.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">{wo.code}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">{wo.completedQty} / {wo.quantity}</Typography>
                    <Typography variant="body2">{((wo.completedQty / Math.max(1, wo.quantity)) * 100).toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(wo.completedQty / Math.max(1, wo.quantity)) * 100} sx={{ mt: 0.5, height: 8, borderRadius: 4 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
