import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, TextField, Typography, MenuItem, InputAdornment, Divider, Chip, Alert, Grid } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { useM04Store } from '@/stores/useM04Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { ShelfConfig } from '@/types/m04';

const columns: Column<ShelfConfig>[] = [
  { id: 'name', label: '配置名称', sortable: true },
  { id: 'shelfTypeName', label: '货架类型', width: 140 },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={r.status === 'active' ? '启用' : r.status === 'draft' ? '草稿' : '停用'} /> },
  { id: 'updatedAt', label: '更新时间', width: 140, render: (r) => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '-' },
];

export default function ConfigFormPage() {
  const navigate = useNavigate();
  const { shelfTypes, configs, currentShelfType, loading, error, fetchShelfTypes, fetchConfigs, fetchShelfTypeById, createConfig, removeConfig } = useM04Store();
  const { onSuccess } = useCrudFeedback();
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formParams, setFormParams] = useState<Record<string, string>>({});
  const [configName, setConfigName] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => { fetchShelfTypes(); fetchConfigs(); }, [fetchShelfTypes, fetchConfigs]);

  useEffect(() => {
    if (selectedTypeId) {
      fetchShelfTypeById(selectedTypeId);
    }
  }, [selectedTypeId, fetchShelfTypeById]);

  const openNew = () => {
    if (!currentShelfType) return;
    const params: Record<string, string> = {};
    currentShelfType.parameterTemplate?.forEach((p) => {
      params[p.key] = String(p.defaultValue ?? '');
    });
    setFormParams(params);
    setConfigName('');
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTypeId || !configName) return;
    const numericParams: Record<string, string | number> = {};
    currentShelfType?.parameterTemplate?.forEach((p) => {
      const val = formParams[p.key];
      numericParams[p.key] = p.type === 'number' ? Number(val) || 0 : val;
    });
    // 后端 CreateShelfConfigDto: shelfTypeId + name + parameters (不含 shelfTypeName)
    await createConfig({ shelfTypeId: selectedTypeId, name: configName, parameters: numericParams, status: 'draft' });
    setDrawerOpen(false);
    onSuccess('配置创建成功');
  };

  const renderParamField = (param: { key: string; label: string; type: string; unit?: string; required?: boolean; options?: string[]; min?: number; max?: number; defaultValue?: string | number }) => {
    if (param.type === 'select') {
      return (
        <TextField select fullWidth size="small" label={param.label} required={param.required} value={formParams[param.key] || ''} onChange={(e) => setFormParams({ ...formParams, [param.key]: e.target.value })}>
          {(param.options || []).map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      );
    }
    return (
      <TextField
        fullWidth size="small" label={`${param.label}${param.unit ? ` (${param.unit})` : ''}`} type={param.type === 'number' ? 'number' : 'text'} required={param.required}
        value={formParams[param.key] || ''}
        onChange={(e) => setFormParams({ ...formParams, [param.key]: e.target.value })}
        InputProps={{ endAdornment: param.unit ? <InputAdornment position="end">{param.unit}</InputAdornment> : undefined }}
        inputProps={param.type === 'number' ? { min: param.min, max: param.max } : undefined}
      />
    );
  };

  const filteredConfigs = configs.filter((c) => c.shelfTypeId === selectedTypeId);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="货架配置" />

      <TextField select size="small" label="选择货架类型" value={selectedTypeId} onChange={(e) => setSelectedTypeId(e.target.value)} sx={{ mb: 2, minWidth: 300 }}>
        {shelfTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.code} - {t.name}</MenuItem>)}
      </TextField>

      {selectedTypeId && currentShelfType && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">{currentShelfType.name}</Typography>
              <Button variant="contained" onClick={openNew}>新建配置</Button>
            </Box>
            <Typography variant="body2" color="text.secondary">{currentShelfType.description}</Typography>
            {currentShelfType.parameterTemplate?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {currentShelfType.parameterTemplate.map((p) => (
                  <Chip key={p.key} label={`${p.label}${p.unit ? ` (${p.unit})` : ''}`} size="small" variant="outlined" />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTypeId && (
        <DataTable
          columns={columns}
          rows={filteredConfigs}
          rowKey="id"
          loading={loading}
          page={page}
          pageSize={20}
          total={filteredConfigs.length}
          onPageChange={setPage}
          actions={[
            { label: '计算BOM', onClick: (row) => navigate(`/m04/bom-result?configId=${(row as ShelfConfig).id}`) },
            { label: '规格匹配', onClick: (row) => navigate(`/m04/specifications?configId=${(row as ShelfConfig).id}`) },
            { label: '删除', onClick: async (row) => { await removeConfig((row as ShelfConfig).id); onSuccess('删除成功'); }, color: 'error' },
          ]}
        />
      )}

      {!selectedTypeId && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>请先选择一个货架类型</Typography>
      )}

      <FormDrawer open={drawerOpen} onCancel={() => setDrawerOpen(false)} title="新建配置" width={600} onSave={handleSave}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormDrawer.TextField label="配置名称" value={configName} onChange={setConfigName} required />
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">参数配置</Typography>
          {currentShelfType?.parameterTemplate?.map((p) => (
            <Box key={p.key}>{renderParamField(p)}</Box>
          ))}
        </Box>
      </FormDrawer>
    </Box>
  );
}
