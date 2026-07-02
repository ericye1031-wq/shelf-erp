import { useEffect, useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Grid, Alert, FormControl, InputLabel,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM19Store } from '@/stores/useM19Store';
import { formatDate } from '@/utils/format';

const WC_COLORS: Record<string, string> = { WC1: '#2196F3', WC2: '#4CAF50', WC3: '#FF9800' };
const GANTT_LEFT_W = 80;
const ROW_H = 36;
const HOUR_W = 64;

export default function AiSchedulePage() {
  const {
    equipment, workOrders, currentResult, history,
    optimizing, loading, error,
    fetchEquipment, fetchWorkOrders, fetchHistory, runOptimization,
  } = useM19Store();

  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    fetchEquipment();
    fetchWorkOrders();
    fetchHistory();
  }, [fetchEquipment, fetchWorkOrders, fetchHistory]);

  const handleOptimize = () => {
    if (!selectedBatch) return;
    runOptimization(selectedBatch);
  };

  const hourRange = useMemo(() => {
    if (!currentResult?.schedule?.length) return { min: 0, max: 24, total: 24 };
    let mn = Infinity, mx = -Infinity;
    currentResult.schedule.forEach((s: any) => {
      if (s.startHour < mn) mn = s.startHour;
      if (s.endHour > mx) mx = s.endHour;
    });
    return { min: Math.max(0, Math.floor(mn) - 1), max: Math.ceil(mx) + 1, total: Math.max(1, Math.ceil(mx) - Math.floor(mn) + 2) };
  }, [currentResult]);

  const ganttW = Math.max(400, GANTT_LEFT_W + hourRange.total * HOUR_W);

  const barsByWc = useMemo(() => {
    if (!currentResult?.schedule) return new Map<string, any[]>();
    const map = new Map<string, any[]>();
    currentResult.schedule.forEach((s: any) => {
      const wc = s.equipmentId || s.workCenter || 'WC1';
      const arr = map.get(wc) || [];
      arr.push(s);
      map.set(wc, arr);
    });
    return map;
  }, [currentResult]);

  const wcNames = useMemo(() => Array.from(barsByWc.keys()), [barsByWc]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading || optimizing} />
      <PageHeader title="AI智能排产" subtitle="选择批次工单，AI自动优化排程" />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 控制区 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>选择批次</InputLabel>
            <Select value={selectedBatch} label="选择批次" onChange={(e) => setSelectedBatch(e.target.value)}>
              {workOrders.length === 0 && <MenuItem disabled value="">暂无可选工单</MenuItem>}
              <MenuItem value="batch-all">全部待排程工单 ({workOrders.length})</MenuItem>
              {workOrders.map((wo) => <MenuItem key={wo.id} value={wo.id}>{wo.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" color="warning" onClick={handleOptimize} disabled={!selectedBatch || optimizing}>
            {optimizing ? '优化中…' : 'AI优化排产'}
          </Button>
        </CardContent>
      </Card>

      {/* 甘特图 */}
      {currentResult && (
        <Card sx={{ mb: 3, overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>排产甘特图</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: ganttW }}>
                {/* 时间轴 */}
                <Box sx={{ display: 'flex', height: 28, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ width: GANTT_LEFT_W, flexShrink: 0 }} />
                  {Array.from({ length: hourRange.total }, (_, i) => (
                    <Box key={i} sx={{ width: HOUR_W, flexShrink: 0, textAlign: 'center', fontSize: 11, color: 'text.secondary', lineHeight: '28px' }}>
                      {hourRange.min + i}h
                    </Box>
                  ))}
                </Box>
                {/* 设备行 */}
                {wcNames.map((wc) => {
                  const bars = barsByWc.get(wc) || [];
                  return (
                    <Box key={wc} sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', height: ROW_H, position: 'relative' }}>
                      <Box sx={{ width: GANTT_LEFT_W, flexShrink: 0, px: 1, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, bgcolor: '#FAFAFA', borderRight: 1, borderColor: 'divider' }}>
                        {wc}
                      </Box>
                      <Box sx={{ position: 'relative', flex: 1 }}>
                        {bars.map((bar, idx) => {
                          const left = (bar.startHour - hourRange.min) * HOUR_W;
                          const width = Math.max(4, (bar.endHour - bar.startHour) * HOUR_W);
                          return (
                            <Box
                              key={bar.id || idx}
                              sx={{
                                position: 'absolute', left, top: 5, height: ROW_H - 10, width,
                                bgcolor: WC_COLORS[wc] || '#2196F3', borderRadius: 1, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: '#fff',
                                fontSize: 11, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis', px: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.85 },
                              }}
                              title={`${bar.workOrderCode || bar.name || ''} | ${bar.startHour}h-${bar.endHour}h`}
                            >
                              {bar.workOrderCode || bar.name || ''}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
            {/* 图例 */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {Object.entries(WC_COLORS).map(([k, c]) => (
                <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: c }} />
                  <Typography variant="caption">{k}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 汇总指标 */}
      {currentResult && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">总工期</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#005591' }}>{currentResult.makespan ?? '-'}h</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">设备利用率</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                  {currentResult.equipmentUtilization != null ? `${(currentResult.equipmentUtilization * 100).toFixed(1)}%` : '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">换模时间</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#ED6C02' }}>{currentResult.changeoverTime ?? '-'}h</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">排产工单数</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{currentResult.schedule?.length ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 历史记录 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>排产历史</Typography>
          {history.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>暂无排产记录</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>批次ID</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>总工期(h)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>设备利用率</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>换模时间(h)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>创建时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.slice(0, 20).map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell>{h.id}</TableCell>
                      <TableCell align="right">{h.makespan ?? '-'}</TableCell>
                      <TableCell align="right">
                        {h.equipmentUtilization != null ? `${(h.equipmentUtilization * 100).toFixed(1)}%` : '-'}
                      </TableCell>
                      <TableCell align="right">{h.changeoverTime ?? '-'}</TableCell>
                      <TableCell>{formatDate(h.createdAt)}</TableCell>
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
