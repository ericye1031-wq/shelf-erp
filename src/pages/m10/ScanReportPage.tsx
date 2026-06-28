import { useEffect, useState } from 'react';
import {
  Box, TextField, MenuItem, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { ScanRecord } from '@/types/m10';
import { formatDate } from '@/utils/format';

const TYPE_LABELS: Record<string, string> = {
  start: '开工', pause: '暂停', complete: '完工', defect: '不良品',
};
const TYPE_COLORS: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  start: 'info', pause: 'warning', complete: 'success', defect: 'error',
};

export default function ScanReportPage() {
  const { scanRecords, loading, fetchScanRecords, createScanRecord } = useM10Store();
  const [woFilter, setWoFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    workOrderId: '', processStepId: '', operatorName: '',
    type: 'start', quantity: 0, remark: '',
  });

  useEffect(() => { fetchScanRecords(); }, [fetchScanRecords]);

  const filtered = scanRecords.filter((r) => {
    if (woFilter && !r.workOrderId.includes(woFilter)) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    return true;
  });

  const handleSubmit = async () => {
    await createScanRecord({
      workOrderId: form.workOrderId,
      processStepId: form.processStepId,
      operatorName: form.operatorName,
      type: form.type,
      quantity: form.quantity,
      remark: form.remark || undefined,
    });
    setDialogOpen(false);
    setForm({ workOrderId: '', processStepId: '', operatorName: '', type: 'start', quantity: 0, remark: '' });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="扫码报工"
        subtitle={`共 ${filtered.length} 条记录`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}
            sx={{ backgroundColor: '#005591' }}>
            新增扫码
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" label="工单ID" value={woFilter}
          onChange={(e) => setWoFilter(e.target.value)} sx={{ minWidth: 160 }} />
        <TextField select size="small" label="类型" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 120 }}>
          <MenuItem value="">全部</MenuItem>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无扫码记录</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>工单ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>工序ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>操作员</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>类型</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">数量</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">不良数</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>扫码时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.workOrderId}</TableCell>
                  <TableCell>{r.processStepId}</TableCell>
                  <TableCell>{r.operatorName}</TableCell>
                  <TableCell>
                    <Chip label={TYPE_LABELS[r.type] || r.type} size="small"
                      color={TYPE_COLORS[r.type] || 'default'} />
                  </TableCell>
                  <TableCell align="right">{r.quantity}</TableCell>
                  <TableCell align="right">{r.defectQty}</TableCell>
                  <TableCell>{formatDate(r.scannedAt, 'YYYY-MM-DD HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新增扫码记录</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="工单ID" size="small" required
              value={form.workOrderId} onChange={(e) => setForm({ ...form, workOrderId: e.target.value })} />
            <TextField label="工序ID" size="small"
              value={form.processStepId} onChange={(e) => setForm({ ...form, processStepId: e.target.value })} />
            <TextField label="操作员" size="small" required
              value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} />
            <TextField select label="类型" size="small" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </TextField>
            <TextField label="数量" type="number" size="small" required
              value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })} />
            <TextField label="备注" size="small" multiline rows={2}
              value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={!form.workOrderId || !form.operatorName}
            sx={{ backgroundColor: '#005591' }}>提交</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
