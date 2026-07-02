import { useEffect } from 'react';
import { Box, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM08Store } from '@/stores/useM08Store';

export default function AlternativeMaterialPage() {
  const { alternatives, loading, fetchAlternatives } = useM08Store();

  useEffect(() => { fetchAlternatives('default'); }, [fetchAlternatives]);

  const displayed = alternatives.slice(0, 20);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="替代料管理" subtitle={`共 ${alternatives.length} 条替代料记录`} />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              {['原物料编码', '原物料名称', '替代编码', '替代名称', '规格', '优先级', '价差(¥)', '可用状态'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: '#005591' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无替代料数据</TableCell>
              </TableRow>
            ) : (
              displayed.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{a.originalItemId}</TableCell>
                  <TableCell>{a.partName}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{a.partCode}</TableCell>
                  <TableCell>{a.partName}</TableCell>
                  <TableCell>{a.spec}</TableCell>
                  <TableCell align="center">
                    <Chip label={`P${a.priority}`} size="small" color={a.priority === 1 ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: a.priceDiff > 0 ? '#D32F2F' : '#2E7D32', fontWeight: 600 }}
                    >
                      {a.priceDiff > 0 ? '+' : ''}{a.priceDiff.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={a.available ? '可用' : '不可用'} size="small" color={a.available ? 'success' : 'error'} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
