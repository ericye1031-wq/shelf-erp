import { useEffect, useState, useMemo } from 'react';
import {
  Box, TextField, MenuItem, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Card, CardContent, Grid,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { QualityCheck } from '@/types/m10';
import { formatDate } from '@/utils/format';

const TYPE_LABELS: Record<string, string> = {
  first_article: '首件检验', in_process: '过程检验', final: '终检',
};
const RESULT_LABELS: Record<string, string> = {
  pass: '合格', fail: '不合格', conditional: '有条件合格',
};
const RESULT_COLORS: Record<string, 'success' | 'error' | 'warning'> = {
  pass: 'success', fail: 'error', conditional: 'warning',
};

export default function QualityPage() {
  const { qualityChecks, loading, fetchQualityChecks, workOrders, fetchWorkOrders } = useM10Store();
  const [woFilter, setWoFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchQualityChecks(); fetchWorkOrders(); }, [fetchQualityChecks, fetchWorkOrders]);

  const filtered = useMemo(() => {
    return qualityChecks.filter((q) => {
      if (woFilter && !q.workOrderId.includes(woFilter)) return false;
      if (resultFilter && q.result !== resultFilter) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      return true;
    });
  }, [qualityChecks, woFilter, resultFilter, typeFilter]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const passCount = filtered.filter((q) => q.result === 'pass').length;
    const failCount = filtered.filter((q) => q.result === 'fail').length;
    const conditionalCount = filtered.filter((q) => q.result === 'conditional').length;
    const passRate = total ? ((passCount / total) * 100).toFixed(1) : '0';
    return { total, passCount, failCount, conditionalCount, passRate };
  }, [filtered]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="质检管理" subtitle="首件检验 / 过程检验 / 终检记录" />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>{summary.total}</Typography>
              <Typography variant="caption" color="text.secondary">总检验</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="success.main">{summary.passRate}%</Typography>
              <Typography variant="caption" color="success.main">合格率</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="success.main">{summary.passCount}</Typography>
              <Typography variant="caption" color="text.secondary">合格</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="error.main">{summary.failCount}</Typography>
              <Typography variant="caption" color="text.secondary">不合格</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label="工单ID" value={woFilter}
          onChange={(e) => setWoFilter(e.target.value)} sx={{ minWidth: 160 }} />
        <TextField select size="small" label="检验类型" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 130 }}>
          <MenuItem value="">全部</MenuItem>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="结果" value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)} sx={{ minWidth: 130 }}>
          <MenuItem value="">全部</MenuItem>
          {Object.entries(RESULT_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无质检记录</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>工单ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>检验类型</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>检验结果</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>检验员</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>检验时间</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>备注</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((q) => (
                <TableRow key={q.id} hover
                  sx={{
                    borderLeft: 4,
                    borderColor:
                      q.result === 'pass' ? 'success.main' :
                      q.result === 'fail' ? 'error.main' : 'warning.main',
                  }}
                >
                  <TableCell>{q.workOrderId}</TableCell>
                  <TableCell>
                    <Chip label={TYPE_LABELS[q.type] || q.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={RESULT_LABELS[q.result] || q.result} size="small"
                      color={RESULT_COLORS[q.result] || 'default'} />
                  </TableCell>
                  <TableCell>{q.inspectorName}</TableCell>
                  <TableCell>{formatDate(q.checkedAt, 'YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.remark || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
