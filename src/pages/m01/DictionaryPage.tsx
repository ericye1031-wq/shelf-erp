import { useState, useEffect, useMemo } from 'react';
import { Box, Paper, List, ListItemButton, ListItemText, Typography, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import FormDrawer from '@/components/common/FormDrawer';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM01Store } from '@/stores/useM01Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { TextField, Stack } from '@mui/material';
import type { Dictionary } from '@/types/m01';

const dictColumns: Column<Dictionary>[] = [
  { id: 'code', label: '编码', sortable: true, width: 120 },
  { id: 'label', label: '名称', sortable: true },
  { id: 'value', label: '值', width: 120 },
  { id: 'sort', label: '排序', width: 80, align: 'center' },
  { id: 'remark', label: '备注', width: 200 },
];

export default function DictionaryPage() {
  const { dictionaries, loading, error, fetchDictionaries, createDict } = useM01Store();
  const { onSuccess } = useCrudFeedback();
  const [selectedCat, setSelectedCat] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { fetchDictionaries(); }, [fetchDictionaries]);

  const categories = useMemo(() => [...new Set(dictionaries.map((d) => d.category))], [dictionaries]);
  const filtered = selectedCat ? dictionaries.filter((d) => d.category === selectedCat) : dictionaries;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="数据字典" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)}
          sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>新增条目</Button>
      } />
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 180px)' }}>
        <Paper variant="outlined" sx={{ width: 220, p: 1, overflow: 'auto', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="#005591" fontWeight={700} sx={{ p: 1, pb: 0.5 }}>分类</Typography>
          <List dense>
            <ListItemButton selected={!selectedCat} onClick={() => setSelectedCat('')}
              sx={{ '&.Mui-selected': { backgroundColor: '#E3F2FD' } }}>
              <ListItemText primary="全部" />
            </ListItemButton>
            {categories.map((cat) => (
              <ListItemButton key={cat} selected={cat === selectedCat} onClick={() => setSelectedCat(cat)}
                sx={{ '&.Mui-selected': { backgroundColor: '#E3F2FD' } }}>
                <ListItemText primary={cat} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
        <Box sx={{ flex: 1 }}>
          <DataTable columns={dictColumns} rows={filtered} />
        </Box>
      </Box>
      <FormDrawer open={drawerOpen} title="新增字典条目" onCancel={() => setDrawerOpen(false)}
        onSubmit={() => { createDict({ category: 'default', code: 'NEW', label: '新条目', value: '', sort: 0, parentId: null, remark: '' }); setDrawerOpen(false); onSuccess('新增成功'); }}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="分类" size="small" fullWidth required />
          <TextField label="编码" size="small" fullWidth required />
          <TextField label="名称" size="small" fullWidth required />
          <TextField label="值" size="small" fullWidth />
          <TextField label="排序" size="small" fullWidth type="number" defaultValue={0} />
          <TextField label="备注" size="small" fullWidth multiline rows={2} />
        </Stack>
      </FormDrawer>
    </Box>
  );
}
