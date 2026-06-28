import { useEffect, useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, LinearProgress, Grid, Alert, FormControl, InputLabel,
  OutlinedInput, Checkbox, ListItemText,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM19Store } from '@/stores/useM19Store';
import { formatDate } from '@/utils/format';
import type { GanttBar } from '@/types/m19';

const STATUS_COLORS: Record<string, string> = {
  pending: '#2196F3', running: '#4CAF50', completed: '#9E9E9E', delayed: '#F44336',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待排程', running: '生产中', completed: '已完成', delayed: '已延误',
};

const HOUR_WIDTH = 60;
const ROW_HEIGHT = 32;
const GANTT_LEFT_WIDTH = 120;

export default function AiSchedulePage() {
  const {
    equipment, workOrders, currentResult, history,
    optimizing, loading, error,
    fetchEquipment, fetchWorkOrders, fetchHistory, runOptimization,
  } = useM19Store();

  const [selectedWoIds, setSelectedWoIds] = useState<string[]>([]);

  useEffect(() => {
    fetchEquipment();
    fetchWorkOrders();
    fetchHistory();
  }, [fetchEquipment, fetchWorkOrders, fetchHistory]);

  const handleOptimize = () => {
    if (selectedWoIds.length === 0) return;
    runOptimization(selectedWoIds);
  };

  const ganttHours = useMemo(() => {
    if (!currentResult) return { minHour: 0, maxHour: 24, range: 24 };
    let minH = Infinity, maxH = -Infinity;
    currentResult.ganttBars.forEach((b) => {
      if (b.startHour < minH) minH = b.startHour;
      if (b.endHour > maxH) maxH = b.endHour;
    });
    minH = Math.max(0, Math.floor(minH) - 1);
    maxH = Math.ceil(maxH) + 1;
    return { minHour: minH, maxHour: maxH, range: maxH - minH };
  }, [currentResult]);

  const ganttWidth = Math.max(400, ganttHours.range * HOUR_WIDTH + GANTT_LEFT_WIDTH);

  // Group bars by equipment
  const equipmentBars = useMemo(() => {
    if (!currentResult) return new Map<string, GanttBar[]>();
    const map = new Map<string, GanttBar[]>();
    currentResult.ganttBars.forEach((b) => {
      const arr = map.get(b.equipmentName) || [];
      arr.push(b);
      map.set(b.equipmentName, arr);
    });
    return map;
  }, [currentResult]);

  const equipmentNames = useMemo(() => {
    return currentResult ? Array.from(equipmentBars.keys()) : [];
  }, [currentResult, equipmentBars]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="AI智能排产"
        subtitle="基于遗传算法优化生产排程，最大化设备利用率，最小化换模时间"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 配置区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>选择工单批次</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>选择工单</InputLabel>
                <Select
                  multiple
                  value={selectedWoIds}
                  onChange={(e) => setSelectedWoIds(e.target.value as string[])}
                  input={<OutlinedInput label="选择工单" />}
                  renderValue={(selected) =>
                    workOrders
                      .filter((wo) => selected.includes(wo.id))
                      .map((wo) => wo.code)
                      .join(', ')
                  }
                >
                  {workOrders.map((wo) => (
                    <MenuItem key={wo.id} value={wo.id}>
                      <Checkbox checked={selectedWoIds.includes(wo.id)} />
                      <ListItemText
                        primary={`${wo.code} - ${wo.productName}`}
                        secondary={`数量: ${wo.quantity} | 交期: ${formatDate(wo.dueDate)}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleOptimize}
                disabled={selectedWoIds.length === 0 || optimizing}
                sx={{ backgroundColor: '#005591', px: 3 }}
              >
                AI优化排产
              </Button>
            </Grid>
          </Grid>

          {optimizing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ color: '#005591' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                AI正在优化排产方案...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 排产结果 */}
      {currentResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>排产结果</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4}>
                <Card variant="outlined" sx={{ bgcolor: '#E3F2FD' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" color="text.secondary">总完工时间</Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                      {currentResult.makespan.toFixed(1)}h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card variant="outlined" sx={{ bgcolor: '#E8F5E9' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" color="text.secondary">设备利用率</Typography>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                      {(currentResult.equipmentUtilization * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card variant="outlined" sx={{ bgcolor: '#FFF3E0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" color="text.secondary">换模时间</Typography>
                    <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
                      {currentResult.changeoverTime.toFixed(1)}h
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 甘特图 */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>甘特图</Typography>
            <Box sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ minWidth: ganttWidth, position: 'relative' }}>
                {/* 时间轴 */}
                <Box sx={{ display: 'flex', ml: `${GANTT_LEFT_WIDTH}px`, borderBottom: 1, borderColor: 'divider', height: 30 }}>
                  {Array.from({ length: Math.ceil(ganttHours.range) }, (_, i) => {
                    const hour = ganttHours.minHour + i;
                    return (
                      <Box
                        key={hour}
                        sx={{
                          width: HOUR_WIDTH,
                          flexShrink: 0,
                          textAlign: 'center',
                          fontSize: 11,
                          color: 'text.secondary',
                          borderRight: 1,
                          borderColor: 'divider',
                          lineHeight: '30px',
                        }}
                      >
                        {hour}h
                      </Box>
                    );
                  })}
                </Box>

                {/* 设备行 */}
                {equipmentNames.map((eqName) => {
                  const bars = equipmentBars.get(eqName) || [];
                  return (
                    <Box
                      key={eqName}
                      sx={{
                        display: 'flex',
                        borderBottom: 1,
                        borderColor: 'divider',
                        height: ROW_HEIGHT,
                        position: 'relative',
                      }}
                    >
                      {/* 设备名 */}
                      <Box
                        sx={{
                          width: GANTT_LEFT_WIDTH,
                          flexShrink: 0,
                          px: 1,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: 12,
                          fontWeight: 600,
                          borderRight: 1,
                          borderColor: 'divider',
                          backgroundColor: '#FAFAFA',
                        }}
                      >
                        {eqName}
                      </Box>

                      {/* 甘特条区域 */}
                      <Box sx={{ position: 'relative', flex: 1 }}>
                        {bars.map((bar) => {
                          const left = (bar.startHour - ganttHours.minHour) * HOUR_WIDTH;
                          const width = (bar.endHour - bar.startHour) * HOUR_WIDTH;
                          return (
                            <Box
                              key={bar.id}
                              sx={{
                                position: 'absolute',
                                left,
                                top: 4,
                                height: ROW_HEIGHT - 8,
                                width: Math.max(width, 4),
                                backgroundColor: STATUS_COLORS[bar.status] || '#2196F3',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 600,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                px: 0.5,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.85 },
                              }}
                              title={`${bar.workOrderCode} | ${bar.startHour}h-${bar.endHour}h | ${STATUS_LABELS[bar.status]}`}
                            >
                              {bar.workOrderCode}
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
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: STATUS_COLORS[key] }} />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>排产历史</Typography>
          {history.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              暂无排产记录
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>批次ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">工单数</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">总工期(h)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">设备利用率</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="center">状态</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>创建时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell>{h.batchId}</TableCell>
                      <TableCell align="right">{h.workOrderCount}</TableCell>
                      <TableCell align="right">{h.makespan.toFixed(1)}</TableCell>
                      <TableCell align="right">
                        {(h.equipmentUtilization * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={h.status === 'applied' ? '已应用' : '模拟'}
                          size="small"
                          color={h.status === 'applied' ? 'success' : 'default'}
                        />
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
