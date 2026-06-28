import { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM12Store } from '@/stores/useM12Store';

export default function VariancePage() {
  const { variances, loading, fetchVariances } = useM12Store();

  useEffect(() => { fetchVariances(); }, [fetchVariances]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="差异分析" />
      {!variances.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无差异数据</Typography>
      ) : (
        <Grid container spacing={2}>
          {variances.map((v) => (
            <Grid item xs={12} md={6} key={v.id}>
              <Card sx={{ borderLeft: 4, borderColor: v.variance > 0 ? 'error.main' : 'success.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2">{v.projectId}</Typography>
                      <Typography variant="body2" color="text.secondary">{v.category} · {v.period}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {v.variance > 0 ? <TrendingUpIcon color="error" /> : <TrendingDownIcon color="success" />}
                      <Typography variant="h6" color={v.variance > 0 ? 'error' : 'success'}>
                        {v.variance > 0 ? '+' : ''}{v.varianceRate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">预算: ¥{v.budgetAmount.toFixed(2)} | 实际: ¥{v.actualAmount.toFixed(2)} | 差异: ¥{v.variance.toFixed(2)}</Typography>
                    {v.reason && <Typography variant="caption" color="text.secondary">原因: {v.reason}</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
