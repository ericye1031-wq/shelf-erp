import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Grid, FormControl, InputLabel,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM20Store } from '@/stores/useM20Store';
import { formatMoney } from '@/utils/format';

const MONTHS_OPTIONS = [3, 6, 12];

export default function AiCostPredictionPage() {
  const {
    targets, predictions, history, currentPrediction,
    predicting, loading, error,
    fetchTargets, fetchPredictions, fetchHistory, runPrediction,
  } = useM20Store();

  const [selectedTarget, setSelectedTarget] = useState('');
  const [months, setMonths] = useState(6);

  useEffect(() => {
    fetchTargets();
    fetchPredictions();
    fetchHistory();
  }, [fetchTargets, fetchPredictions, fetchHistory]);

  const handlePredict = () => {
    if (!selectedTarget) return;
    runPrediction(selectedTarget, months);
  };

  const allPredictions = currentPrediction
    ? [currentPrediction, ...predictions.filter((p) => p.id !== currentPrediction.id)]
    : predictions;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="AI成本预测" subtitle="基于历史价格趋势与ML模型，预测材料/项目未来成本走势" />

      {/* Prediction Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>物料编码</InputLabel>
                <Select
                  value={selectedTarget}
                  label="物料编码"
                  onChange={(e) => setSelectedTarget(e.target.value)}
                >
                  {targets.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.code} - {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>预测月数</InputLabel>
                <Select
                  value={months}
                  label="预测月数"
                  onChange={(e) => setMonths(Number(e.target.value))}
                >
                  {MONTHS_OPTIONS.map((m) => (
                    <MenuItem key={m} value={m}>{m}个月</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handlePredict}
                disabled={!selectedTarget || predicting}
                sx={{ height: 40 }}
              >
                {predicting ? '预测中...' : '预测'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Current Prediction Result */}
      {currentPrediction && (
        <Card sx={{ mb: 3, border: 1, borderColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              预测结果: {currentPrediction.materialCode}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">历史均价</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMoney(currentPrediction.historicalPrice ?? 0)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">预测3个月</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatMoney(currentPrediction.predictedPrice3m)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">预测6个月</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {formatMoney(currentPrediction.predictedPrice6m)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">置信区间</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {formatMoney(currentPrediction.confidenceLower)} ~ {formatMoney(currentPrediction.confidenceUpper)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Prediction Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>预测记录</Typography>
          {allPredictions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              暂无预测记录
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>物料编码</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>物料名称</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">历史价格</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">预测3月</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">预测6月</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">趋势</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPredictions.map((p) => {
                    const trend = p.predictedPrice6m - (p.historicalPrice ?? p.predictedPrice3m);
                    return (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.materialCode}</TableCell>
                        <TableCell>{p.materialName}</TableCell>
                        <TableCell align="right">{formatMoney(p.historicalPrice ?? 0)}</TableCell>
                        <TableCell align="right">
                          <Typography color="primary.main" fontWeight={600}>
                            {formatMoney(p.predictedPrice3m)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="warning.main" fontWeight={600}>
                            {formatMoney(p.predictedPrice6m)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={trend > 0 ? '↑ 看涨' : trend < 0 ? '↓ 看跌' : '→ 平稳'}
                            size="small"
                            color={trend > 0 ? 'error' : trend < 0 ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
