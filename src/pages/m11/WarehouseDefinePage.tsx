import { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM11Store } from '@/stores/useM11Store';
import type { Warehouse } from '@/types/m11';

const TYPE_OPTIONS = ['原料仓', '半成品仓', '成品仓', '辅料仓', '退货仓'];

export default function WarehouseDefinePage() {
  const { warehouses, loading, fetchWarehouses, createWarehouse } = useM11Store();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', location: '', type: '原料仓', managerName: '' });

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const handleAdd = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    await createWarehouse({
      code: form.code, name: form.name, type: form.type,
      address: form.location, managerName: form.managerName, status: 'active',
    });
    setDialogOpen(false);
    setForm({ code: '', name: '', location: '', type: '原料仓', managerName: '' });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="仓库定义"
        subtitle={`共 ${warehouses.length} 个仓库`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            新增仓库
          </Button>
        }
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              {['编码', '名称', '位置', '类型', '负责人', '状态'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: '#005591' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无仓库数据</TableCell>
              </TableRow>
            ) : (
              warehouses.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{w.code}</TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.address}</TableCell>
                  <TableCell>{w.type}</TableCell>
                  <TableCell>{w.managerName}</TableCell>
                  <TableCell>
                    <Chip
                      label={w.status === 'active' ? '启用' : '停用'}
                      size="small"
                      color={w.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新增仓库对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新增仓库</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="仓库编码" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="仓库名称" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="位置" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth size="small" label="类型" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPE_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="负责人" value={form.managerName}
                onChange={(e) => setForm({ ...form, managerName: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAdd}>确认新增</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
