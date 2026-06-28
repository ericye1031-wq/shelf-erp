import { useEffect, useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { OeeData } from '@/types/m10';
import { formatDate } from '@/utils/format';

/** OEE指标颜色判断 */
function oeeColor(value: number): 'success' | 'warning' | 'error' {
  if (value >= 85) return 'success';
  if (value >= 70) return 'warning';
  return 'error';
}

function oeeColorHex(value: number): string {
  if (value >= 85) return '#2E7D32';
  if (value >= 70) return '#E65100';
  return '#C62828';
}

/** 汇总卡 */
function SummaryCard({ label, value, suffix = '%' }: { label: string; value: string; suffix?: string }) {
  return (
    <Card sx={{ textAlign: 'center', height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
        <Typography variant="h4" fontWeight={700} color="#005591">
          {value}{suffix}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function OeeDashboardPage() {
  const { oeeData, loading, fetchOee, equipment, fetchEquipment } = useM10Store();
  const [equipFilter, setEquipFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchOee(); fetchEquipment(); }, [fetchOee, fetchEquipment]);

  const filtered = useMemo(() => {
    return oeeData.filter((d) => {
      if (equipFilter && d.equipmentName !== equipFilter) return false;
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      return true;
    });
  }, [oeeData, equipFilter, dateFrom, dateTo]);

  const avgOee = filtered.length
    ? (filtered.reduce((s, d) => s + d.oee, 0) / filtered.length).toFixed(1)
    : '0';
  const avgAvailability = filtered.length
    ? (filtered.reduce((s, d) => s + d.availability, 0) / filtered.length).toFixed(1)
    : '0';
  const avgPerformance = filtered.length
    ? (filtered.reduce((s, d) => s + d.performance, 0) / filtered.length).toFixed(1)
    : '0';
  const avgQuality = filtered.length
    ? (filtered.reduce((s, d) => s + d.quality, 0) / filtered.length).toFixed(1)
    : '0';

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="OEE看板" subtitle="设备综合效率实时监控" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="平均 OEE" value={avgOee} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="可用性" value={avgAvailability} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="性能" value={avgPerformance} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="质量" value={avgQuality} />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField select size="small" label="设备" value={equipFilter} onChange={(e) => setEquipFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">全部</MenuItem>
          {equipment.map((eq) => (
            <MenuItem key={eq.id} value={eq.name}>{eq.name}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" label="开始日期" type="date" value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="结束日期" type="date" value={dateTo}
          onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无OEE数据</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>设备</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>日期</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">可用性</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">性能</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">质量</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">OEE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((d) => (
                <OeeRow key={d.id} data={d} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function OeeRow({ data }: { data: OeeData }) {
  const metrics: { label: string; value: number }[] = [
    { label: 'availability', value: data.availability },
    { label: 'performance', value: data.performance },
    { label: 'quality', value: data.quality },
    { label: 'oee', value: data.oee },
  ];

  return (
    <TableRow hover>
      <TableCell>{data.equipmentName}</TableCell>
      <TableCell>{formatDate(data.date)}</TableCell>
      {metrics.map((m) => (
        <TableCell key={m.label} align="right" sx={{ minWidth: 140 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ minWidth: 42, textAlign: 'right' }}>
              {m.value.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate" value={Math.min(m.value, 100)}
              color={oeeColor(m.value)}
              sx={{ width: 80, height: 8, borderRadius: 4 }}
            />
          </Box>
        </TableCell>
      ))}
    </TableRow>
  );
}
