import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Select, MenuItem,
  Slider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, LinearProgress, Grid, Alert, FormControl, InputLabel,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM20Store } from '@/stores/useM20Store';
import { formatDate, formatMoney, formatPercent } from '@/utils/format';
import type { CostTargetOption, CostTrendPoint } from '@/types/m20';

const MONTH_MARKS = [
  { value: 3, label: '3月' },
  { value: 6, label: '6月' },
  { value: 12, label: '12月' },
];

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

  const selectedTargetObj: CostTargetOption | undefined = targets.find((t) => t.id === selectedTarget);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />

      <PageHeader
        title="AI成本预测"
        subtitle="基于历史价格趋势与ML模型，预测材料/项目未来成本走势"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 预测区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            选择预测目标
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>预测目标</InputLabel>
                <Select
                  value={selectedTarget}
                  label="预测目标"
                  onChange={(e) => setSelectedTarget(e.target.value)}
                >
                  {targets.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} ({t.type === 'material' ? '材料' : '项目'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5} md={4}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>预测月数</Typography>
              <Slider
                value={months}
                onChange={(_e, v) => setMonths(v as number)}
                step={null}
                marks={MONTH_MARKS}
                min={3}
                max={12}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUpIcon />}
                onClick={handlePredict}
                disabled={!selectedTarget || predicting}
                sx={{ backgroundColor: '#005591' }}
              >
                预测
              </Button>
            </Grid>
          </Grid>

          {predicting && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ color: '#005591' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                AI正在学习历史趋势，生成成本预测...
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
              预测结果 - {currentPrediction.targetName}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ bgcolor: '#E3F2FD' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">预测总成本</Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                      {formatMoney(currentPrediction.predictedTotal)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ bgcolor: '#E8F5E9' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">预测月数</Typography>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                      {currentPrediction.months} 个月
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

            {/* 简易折线图 - SVG实现 */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>价格趋势</Typography>
            <SimpleLineChart data={currentPrediction.trendData} />
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>预测历史</Typography>
          {history.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              暂无预测记录
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>目标名称</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>类型</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="center">预测月数</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">预测总成本</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">实际成本</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">准确率</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>创建时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell>{h.targetName}</TableCell>
                      <TableCell>
                        <Chip
                          label={h.targetType === 'material' ? '材料' : '项目'}
                          size="small"
                          color={h.targetType === 'material' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">{h.months}</TableCell>
                      <TableCell align="right">{formatMoney(h.predictedTotal)}</TableCell>
                      <TableCell align="right">
                        {h.actualTotal != null ? formatMoney(h.actualTotal) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {h.accuracy != null ? (
                          <Chip
                            label={`${h.accuracy.toFixed(1)}%`}
                            size="small"
                            color={h.accuracy >= 90 ? 'success' : h.accuracy >= 70 ? 'warning' : 'error'}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(h.createdAt, 'YYYY-MM-DD HH:mm')}</TableCell>
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

/** 简易SVG折线图：展示历史实际值 + 预测区间 */
function SimpleLineChart({ data }: { data: CostTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        暂无趋势数据
      </Typography>
    );
  }

  const W = 700;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 40, left: 70 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const values = data.flatMap((d) => [
    d.actual,
    d.predicted ?? d.actual,
    d.upperBound ?? d.actual,
    d.lowerBound ?? d.actual,
  ]);
  const minV = Math.min(...values) * 0.9;
  const maxV = Math.max(...values) * 1.1;
  const vRange = maxV - minV || 1;

  const x = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * plotW;
  const y = (v: number) => PAD.top + plotH - ((v - minV) / vRange) * plotH;

  // Build path for actual line
  const actualPts = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.actual)}`)
    .join(' ');

  // Build path for predicted line (only points with predicted value)
  const predIndices = data
    .map((d, i) => ({ ...d, i }))
    .filter((d) => d.predicted != null);
  const predPts = predIndices
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'}${x(d.i)},${y(d.predicted!)}`)
    .join(' ');

  // Build confidence band polygon
  let bandPts = '';
  const bandData = data
    .map((d, i) => ({ ...d, i }))
    .filter((d) => d.upperBound != null && d.lowerBound != null);
  if (bandData.length > 0) {
    bandPts = bandData.map((d) => `${x(d.i)},${y(d.upperBound!)}`).join(' ') +
      ' L' +
      bandData.reverse().map((d) => `${x(d.i)},${y(d.lowerBound!)}`).join(' ') +
      ' Z';
  }

  // Y axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    minV + (vRange / (yTicks - 1)) * i
  );

  // X axis labels (show ~6)
  const xLabelInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, minWidth: 400 }}>
        {/* Grid lines */}
        {yTickValues.map((val, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={PAD.left} y1={y(val)} x2={W - PAD.right} y2={y(val)}
              stroke="#E0E0E0" strokeWidth={0.5} strokeDasharray="4 2"
            />
            <text x={PAD.left - 8} y={y(val) + 4} textAnchor="end" fontSize={10} fill="#757575">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Confidence band */}
        {bandPts && (
          <path d={bandPts} fill="#2196F3" fillOpacity={0.1} stroke="none" />
        )}

        {/* Actual line */}
        {actualPts && (
          <path d={actualPts} fill="none" stroke="#005591" strokeWidth={2} />
        )}

        {/* Predicted line */}
        {predPts && (
          <path d={predPts} fill="none" stroke="#FF9800" strokeWidth={2} strokeDasharray="6 3" />
        )}

        {/* Dots */}
        {data.map((d, i) => {
          const isPredicted = d.predicted != null;
          return (
            <g key={`dot-${i}`}>
              {d.actual !== undefined && (
                <circle cx={x(i)} cy={y(d.actual)} r={3} fill="#005591" />
              )}
              {isPredicted && (
                <circle cx={x(i)} cy={y(d.predicted!)} r={3} fill="#FF9800" />
              )}
            </g>
          );
        })}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % xLabelInterval !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={`xlabel-${i}`}
              x={x(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize={9}
              fill="#757575"
            >
              {d.date.slice(5)}
            </text>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${W - 200}, ${PAD.top - 5})`}>
          <line x1={0} y1={0} x2={20} y2={0} stroke="#005591" strokeWidth={2} />
          <text x={24} y={4} fontSize={10} fill="#757575">实际</text>
          <line x1={60} y1={0} x2={80} y2={0} stroke="#FF9800" strokeWidth={2} strokeDasharray="6 3" />
          <text x={84} y={4} fontSize={10} fill="#757575">预测</text>
          <rect x={120} y={-4} width={16} height={8} fill="#2196F3" fillOpacity={0.15} stroke="#2196F3" strokeWidth={0.5} />
          <text x={140} y={4} fontSize={10} fill="#757575">置信区间</text>
        </g>
      </svg>
    </Box>
  );
}
