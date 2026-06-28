import { useEffect, useState } from 'react';
import {
  Box, TextField, MenuItem, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM09Store } from '@/stores/useM09Store';
import type { Supplier } from '@/types/m09';

const RATING_LABELS: Record<string, string> = { A: 'A级', B: 'B级', C: 'C级', D: 'D级' };
const RATING_COLORS: Record<string, 'warning' | 'success' | 'info' | 'default'> = {
  A: 'warning', B: 'success', C: 'info', D: 'default',
};
const RATING_HEX: Record<string, { bg: string; color: string }> = {
  A: { bg: '#FFF8E1', color: '#F57F17' },
  B: { bg: '#E8F5E9', color: '#2E7D32' },
  C: { bg: '#E3F2FD', color: '#005591' },
  D: { bg: '#F5F5F5', color: '#666666' },
};

export default function SupplierManagePage() {
  const { suppliers, loading, fetchSuppliers, createSupplier, updateSupplier, removeSupplier } = useM09Store();
  const [keyword, setKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    code: '', name: '', supplyCategories: '', rating: 'B' as string,
    contactName: '', contactPhone: '', contactEmail: '', address: '',
    status: 'active' as string, remark: '',
  });

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const filtered = suppliers.filter((s) => {
    if (keyword && !s.name.includes(keyword) && !s.code.includes(keyword)) return false;
    if (ratingFilter && s.rating !== ratingFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', name: '', supplyCategories: '', rating: 'B', contactName: '', contactPhone: '', contactEmail: '', address: '', status: 'active', remark: '' });
    setDialogOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      code: s.code, name: s.name, supplyCategories: s.supplyCategories || '',
      rating: s.rating, contactName: s.contactName || '', contactPhone: s.contactPhone || '',
      contactEmail: s.contactEmail || '', address: s.address || '',
      status: s.status, remark: s.remark || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      code: form.code, name: form.name,
      supplyCategories: form.supplyCategories || undefined,
      rating: form.rating, contactName: form.contactName || undefined,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
      address: form.address || undefined,
      status: form.status, remark: form.remark || undefined,
    };
    if (editing) {
      await updateSupplier(editing.id, data);
    } else {
      await createSupplier(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(`确定删除供应商「${s.name}」？`)) return;
    await removeSupplier(s.id);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="供应商管理"
        subtitle={`共 ${filtered.length} 家供应商`}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ backgroundColor: '#005591' }}>
            新增供应商
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar placeholder="搜索供应商编码/名称" value={keyword} onChange={setKeyword} />
        <TextField select size="small" label="评级" value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)} sx={{ minWidth: 100 }}>
          <MenuItem value="">全部</MenuItem>
          {Object.entries(RATING_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无供应商数据</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>编码</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>名称</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>供应类别</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>评级</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>联系人</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{s.code}</Typography>
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    {s.supplyCategories ? s.supplyCategories.split(',').map((cat) => (
                      <Chip key={cat} label={cat.trim()} size="small" variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }} />
                    )) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip label={RATING_LABELS[s.rating] || s.rating} size="small"
                      sx={{
                        backgroundColor: RATING_HEX[s.rating]?.bg,
                        color: RATING_HEX[s.rating]?.color,
                        fontWeight: 700,
                      }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.contactName || '-'}</Typography>
                    {s.contactPhone && (
                      <Typography variant="caption" color="text.secondary">{s.contactPhone}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status}
                      label={s.status === 'active' ? '启用' : s.status === 'inactive' ? '停用' : '黑名单'} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="编辑">
                      <IconButton size="small" onClick={() => openEdit(s)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton size="small" color="error" onClick={() => handleDelete(s)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? '编辑供应商' : '新增供应商'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="编码" size="small" required fullWidth
                value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <TextField label="名称" size="small" required fullWidth
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Box>
            <TextField label="供应类别" size="small" placeholder="多个用逗号分隔，如：钢材,五金"
              value={form.supplyCategories} onChange={(e) => setForm({ ...form, supplyCategories: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="评级" size="small" value={form.rating} sx={{ minWidth: 120 }}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                {Object.entries(RATING_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
              <TextField select label="状态" size="small" value={form.status} fullWidth
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="active">启用</MenuItem>
                <MenuItem value="inactive">停用</MenuItem>
                <MenuItem value="blacklisted">黑名单</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="联系人" size="small" fullWidth
                value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              <TextField label="联系电话" size="small" fullWidth
                value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </Box>
            <TextField label="邮箱" size="small"
              value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            <TextField label="地址" size="small"
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <TextField label="备注" size="small" multiline rows={2}
              value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={!form.code || !form.name}
            sx={{ backgroundColor: '#005591' }}>{editing ? '保存' : '创建'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
