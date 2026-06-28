import { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM01Store } from '@/stores/useM01Store';
import { TextField } from '@mui/material';
import type { SystemConfig } from '@/types/m01';

export default function SystemConfigPage() {
  const { configs, loading, error, fetchConfigs, updateConfig } = useM01Store();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const groups = useMemo(() => {
    const map = new Map<string, SystemConfig[]>();
    configs.forEach((c) => {
      const list = map.get(c.group) ?? [];
      list.push(c);
      map.set(c.group, list);
    });
    return map;
  }, [configs]);

  const handleSave = (id: string) => {
    const val = editedValues[id];
    if (val !== undefined) {
      updateConfig(id, { value: val });
      setSnackOpen(true);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="系统配置" subtitle="按分组管理配置项" />
      {[...groups.entries()].map(([group, items]) => (
        <Paper key={group} variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Typography variant="subtitle2" fontWeight={700} color="#005591" sx={{ px: 2, py: 1.5, backgroundColor: '#F5F5F5' }}>
            {group}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>配置项</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>说明</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591', width: 280 }}>值</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591', width: 60 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((cfg) => (
                <TableRow key={cfg.id}>
                  <TableCell>{cfg.label}</TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{cfg.remark}</Typography></TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth variant="outlined"
                      defaultValue={cfg.value}
                      onChange={(e) => setEditedValues((prev) => ({ ...prev, [cfg.id]: e.target.value }))} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleSave(cfg.id)} sx={{ color: '#005591' }}>
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)}
        message="配置已保存" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
