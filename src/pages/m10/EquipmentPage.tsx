import { useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Card, CardContent, Typography, Grid,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { Equipment } from '@/types/m10';

const STATUS_CONFIG: Record<string, { label: string; color: 'default' | 'success' | 'primary' | 'warning' | 'error' }> = {
  idle: { label: '空闲', color: 'default' },
  running: { label: '运行中', color: 'success' },
  maintenance: { label: '保养中', color: 'warning' },
  breakdown: { label: '故障', color: 'error' },
};

export default function EquipmentPage() {
  const { equipment, loading, fetchEquipment } = useM10Store();

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const stats = {
    total: equipment.length,
    running: equipment.filter((e) => e.status === 'running').length,
    idle: equipment.filter((e) => e.status === 'idle').length,
    fault: equipment.filter((e) => e.status === 'breakdown').length,
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="设备台账" subtitle={`共 ${stats.total} 台设备 · 运行 ${stats.running} · 空闲 ${stats.idle} · 故障 ${stats.fault}`} />

      {/* 统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: '设备总数', value: stats.total, color: '#005591' },
          { label: '运行中', value: stats.running, color: '#2E7D32' },
          { label: '空闲', value: stats.idle, color: '#757575' },
          { label: '故障', value: stats.fault, color: '#D32F2F' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 设备表格 */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              {['设备编码', '名称', '类型', '车间', '状态', '产能', '当前负荷', '下次保养'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: '#005591' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无设备数据</TableCell>
              </TableRow>
            ) : (
              equipment.map((eq) => {
                const sc = STATUS_CONFIG[eq.status] || STATUS_CONFIG.idle;
                return (
                  <TableRow key={eq.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{eq.code}</TableCell>
                    <TableCell>{eq.name}</TableCell>
                    <TableCell>{eq.type}</TableCell>
                    <TableCell>{eq.workshop}</TableCell>
                    <TableCell>
                      <Chip label={sc.label} color={sc.color} size="small" />
                    </TableCell>
                    <TableCell align="right">{eq.capacity}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        <Box sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: '#E0E0E0', overflow: 'hidden' }}>
                          <Box sx={{ width: `${Math.min(eq.currentLoad, 100)}%`, height: '100%', borderRadius: 3, bgcolor: eq.currentLoad > 80 ? '#D32F2F' : eq.currentLoad > 60 ? '#ED6C02' : '#2E7D32' }} />
                        </Box>
                        <Typography variant="body2">{eq.currentLoad}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{eq.nextMaintenance ?? '-'}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
