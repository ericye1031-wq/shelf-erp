import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM11Store } from '@/stores/useM11Store';
import { formatDate } from '@/utils/format';

const TYPE_LABELS: Record<string, string> = {
  start: '开工', complete: '完工', defect: '缺陷',
  inbound: '入库', outbound: '出库', transfer: '移库', check: '盘点',
};
const TYPE_OPTIONS = ['start', 'complete', 'defect'];

export default function PdaScanPage() {
  const { pdaOperations, loading, fetchPdaOperations } = useM11Store();

  const [qrCode, setQrCode] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [scanType, setScanType] = useState('start');
  const [quantity, setQuantity] = useState('1');
  const [scanError, setScanError] = useState('');

  useEffect(() => { fetchPdaOperations(); }, [fetchPdaOperations]);

  const handleSubmit = () => {
    setScanError('');
    if (!qrCode.trim()) { setScanError('请输入或扫描二维码'); return; }
    if (!workOrderId.trim()) { setScanError('请输入工单编号'); return; }
    // Submit logic would call createPdaOperation here
    setQrCode('');
    setWorkOrderId('');
    setQuantity('1');
  };

  const recentScans = pdaOperations.slice(0, 10);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="PDA扫码" subtitle="扫描生产工序二维码" />

      {/* 扫码表单 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>扫码录入</Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small" label="二维码内容"
                value={qrCode} onChange={(e) => setQrCode(e.target.value)}
                placeholder="扫描或输入二维码"
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth size="small" label="工单编号"
                value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>操作类型</InputLabel>
                <Select value={scanType} label="操作类型" onChange={(e) => setScanType(e.target.value)}>
                  {TYPE_OPTIONS.map((t) => (
                    <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth size="small" label="数量" type="number"
                value={quantity} onChange={(e) => setQuantity(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button variant="contained" fullWidth onClick={handleSubmit}>提交扫码</Button>
            </Grid>
          </Grid>
          {scanError && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{scanError}</Typography>}
        </CardContent>
      </Card>

      {/* 最近扫码记录 */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#005591' }}>最近扫码记录</Typography>
      {recentScans.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无扫码记录</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                {['操作类型', '物料', '数量', '库位', '操作人', '时间'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#005591' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {recentScans.map((op) => (
                <TableRow key={op.id} hover>
                  <TableCell>
                    <Chip label={TYPE_LABELS[op.type] || op.type} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{op.material} {op.spec}</TableCell>
                  <TableCell align="right">{op.quantity} {op.unit}</TableCell>
                  <TableCell>{op.locationId}</TableCell>
                  <TableCell>{op.operatorName}</TableCell>
                  <TableCell>{formatDate(op.operatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
