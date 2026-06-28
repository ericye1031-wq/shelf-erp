import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, LinearProgress, Grid, Alert, FormControl, InputLabel,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM18Store } from '@/stores/useM18Store';
import { formatDate, formatMoney, formatPercent } from '@/utils/format';
import type { QuotationPrediction } from '@/types/m18';

export default function AiQuotationPage() {
  const {
    inquiries, predictions, currentPrediction,
    predicting, loading, error,
    fetchInquiries, fetchPredictions, runPrediction,
  } = useM18Store();

  const [selectedInquiry, setSelectedInquiry] = useState('');

  useEffect(() => {
    fetchInquiries();
    fetchPredictions();
  }, [fetchInquiries, fetchPredictions]);

  const handlePredict = () => {
    if (!selectedInquiry) return;
    runPrediction(selectedInquiry);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />

      <PageHeader
        title="AI智能报价"
        subtitle="基于历史数据与机器学习模型，自动预测报价区间与成本构成"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 预测区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            选择询价单进行预测
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>询价单</InputLabel>
                <Select
                  value={selectedInquiry}
                  label="询价单"
                  onChange={(e) => setSelectedInquiry(e.target.value)}
                >
                  {inquiries.map((inq) => (
                    <MenuItem key={inq.id} value={inq.id}>
                      {inq.code} - {inq.customerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUpIcon />}
                onClick={handlePredict}
                disabled={!selectedInquiry || predicting}
                sx={{ backgroundColor: '#005591', px: 3 }}
              >
                AI预测报价
              </Button>
            </Grid>
          </Grid>

          {predicting && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ color: '#005591' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                AI正在分析数据，预测报价中...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 当前预测结果 */}
      {currentPrediction && (
        <Card sx={{ mb: 3, border: 1, borderColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              预测结果 - {currentPrediction.inquiryCode}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ bgcolor: '#E3F2FD' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">预测低价</Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                      {formatMoney(currentPrediction.predictedLow)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ bgcolor: '#E8F5E9' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">预测高价</Typography>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                      {formatMoney(currentPrediction.predictedHigh)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ bgcolor: '#FFF3E0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">置信度</Typography>
                    <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
                      {formatPercent(currentPrediction.confidence / 100)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ bgcolor: '#F3E5F5' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">预测时间</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDate(currentPrediction.predictedAt, 'MM-DD HH:mm')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 成本分解 */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>成本分解</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>成本类别</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">金额</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">占比</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { label: '材料成本', value: currentPrediction.materialCost },
                    { label: '人工成本', value: currentPrediction.laborCost },
                    { label: '间接费用', value: currentPrediction.overhead },
                  ].map((row) => {
                    const total = currentPrediction.materialCost + currentPrediction.laborCost + currentPrediction.overhead;
                    const pct = total > 0 ? (row.value / total) * 100 : 0;
                    return (
                      <TableRow key={row.label}>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{formatMoney(row.value)}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${pct.toFixed(1)}%`} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>预测历史</Typography>
          {predictions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              暂无预测记录
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>询价单</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">预测低价</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">预测高价</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">实际报价</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">准确率</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="center">状态</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>预测时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.inquiryCode}</TableCell>
                      <TableCell align="right">{formatMoney(p.predictedLow)}</TableCell>
                      <TableCell align="right">{formatMoney(p.predictedHigh)}</TableCell>
                      <TableCell align="right">
                        {p.actualPrice != null ? formatMoney(p.actualPrice) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {p.accuracy != null ? (
                          <Chip
                            label={`${p.accuracy.toFixed(1)}%`}
                            size="small"
                            color={p.accuracy >= 90 ? 'success' : p.accuracy >= 70 ? 'warning' : 'error'}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={p.status === 'confirmed' ? '已确认' : p.status === 'rejected' ? '已拒绝' : '待确认'}
                          size="small"
                          color={p.status === 'confirmed' ? 'success' : p.status === 'rejected' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDate(p.predictedAt, 'YYYY-MM-DD HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
