import { useEffect, useState } from 'react';
import { Box, Button, Alert, Typography, IconButton, Divider, Chip, Accordion, AccordionSummary, AccordionDetails, MenuItem, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import FormDrawer from '@/components/common/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM04Store } from '@/stores/useM04Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { ShelfType, ParameterDef } from '@/types/m04';
import type { StatusType } from '@/types/common';
import {
  getColumnSeriesOptions,
  getColumnSpecOptions,
  getBeamSeriesOptions,
  getBeamSpecOptions,
  type ColumnProfile,
  type BeamProfile,
} from '@/services/material-data.service';

const columns: Column<ShelfType>[] = [
  { id: 'code', label: '编码', sortable: true, width: 140 },
  { id: 'name', label: '名称', sortable: true },
  { id: 'category', label: '分类', width: 100 },
  { id: 'paramCount', label: '参数数', width: 80, render: (r) => (r.parameterTemplate?.length ?? 0) },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={r.status === 'draft' ? '草稿' : r.status === 'completed' ? '完成' : '已取消'} /> },
];

const STATUS_OPTIONS = ['active', 'inactive', 'draft'];
const CATEGORIES = ['重型货架', '轻型货架', '阁楼货架', '悬臂货架', '流利货架', '钢平台'];
const PARAM_TYPES: ParameterDef['type'][] = ['number', 'select', 'text'];

function makeEmptyParam(): ParameterDef {
  return { key: '', label: '', type: 'number', unit: '', required: false };
}

export default function ShelfTypeLibPage() {
  const { shelfTypes, loading, error, fetchShelfTypes, createShelfType, updateShelfType, removeShelfType } = useM04Store();
  const { onSuccess } = useCrudFeedback();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<ShelfType | null>(null);
  const [deleteItem, setDeleteItem] = useState<ShelfType | null>(null);
  const [form, setForm] = useState({ name: '', code: '', category: '', description: '', status: 'draft' as StatusType, parameterTemplate: [] as ParameterDef[] });
  const [page, setPage] = useState(0);

  // 型材规格选择
  const [profileConfig, setProfileConfig] = useState({
    columnSeries: 'SQ' as string,
    columnSpec: '',
    beamSeries: 'B50' as string,
    beamSpec: '',
  });

  const columnSeriesOptions = getColumnSeriesOptions();
  const beamSeriesOptions = getBeamSeriesOptions();
  const columnSpecOptions = getColumnSpecOptions(profileConfig.columnSeries as ColumnProfile['series']);
  const beamSpecOptions = getBeamSpecOptions(profileConfig.beamSeries);

  useEffect(() => { fetchShelfTypes(); }, [fetchShelfTypes]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', code: '', category: '', description: '', status: 'draft', parameterTemplate: [makeEmptyParam()] });
    setDrawerOpen(true);
  };

  const openEdit = (item: ShelfType) => {
    setEditItem(item);
    setForm({
      name: item.name,
      code: item.code,
      category: item.category || '',
      description: item.description || '',
      status: item.status,
      parameterTemplate: item.parameterTemplate?.length ? [...item.parameterTemplate] : [makeEmptyParam()],
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    // 过滤掉空参数
    const cleanedTemplate = form.parameterTemplate.filter(p => p.key && p.label);
    if (editItem) {
      await updateShelfType(editItem.id, { ...form, parameterTemplate: cleanedTemplate });
      onSuccess('更新成功');
    } else {
      await createShelfType({ ...form, parameterTemplate: cleanedTemplate });
      onSuccess('创建成功');
    }
    setDrawerOpen(false);
  };

  const addParam = () => {
    setForm({ ...form, parameterTemplate: [...form.parameterTemplate, makeEmptyParam()] });
  };

  const removeParam = (idx: number) => {
    setForm({ ...form, parameterTemplate: form.parameterTemplate.filter((_, i) => i !== idx) });
  };

  const updateParam = (idx: number, field: keyof ParameterDef, value: string | number | boolean) => {
    const newTemplate = [...form.parameterTemplate];
    newTemplate[idx] = { ...newTemplate[idx], [field]: value };
    setForm({ ...form, parameterTemplate: newTemplate });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="货架类型库" action={<Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>新增类型</Button>} />
      <DataTable
        columns={columns}
        rows={shelfTypes}
        rowKey="id"
        page={page}
        pageSize={20}
        total={shelfTypes.length}
        onPageChange={setPage}
        actions={[
          { label: '编辑', onClick: (row) => openEdit(row as ShelfType) },
          { label: '删除', onClick: (row) => setDeleteItem(row as ShelfType), color: 'error' },
        ]}
      />
      <FormDrawer open={drawerOpen} onCancel={() => setDrawerOpen(false)} title={editItem ? '编辑货架类型' : '新增货架类型'} width={640} onSave={handleSave}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormDrawer.TextField label="编码" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
          <FormDrawer.TextField label="名称" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FormDrawer.Select label="分类" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ label: c, value: c }))} required />
          <FormDrawer.TextField label="描述" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline rows={2} />
          <FormDrawer.Select label="状态" value={form.status} onChange={(v) => setForm({ ...form, status: v as StatusType })} options={STATUS_OPTIONS.map((s) => ({ label: s === 'active' ? '启用' : s === 'inactive' ? '停用' : '草稿', value: s }))} />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">型材规格配置（从型材数据库选择）</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 140px', minWidth: 120 }}>
              <TextField select fullWidth size="small" label="立柱系列" value={profileConfig.columnSeries}
                onChange={(e) => setProfileConfig({ ...profileConfig, columnSeries: e.target.value, columnSpec: '' })}>
                {columnSeriesOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
              <TextField select fullWidth size="small" label="立柱规格" value={profileConfig.columnSpec}
                onChange={(e) => setProfileConfig({ ...profileConfig, columnSpec: e.target.value })}>
                <MenuItem value="">请选择</MenuItem>
                {columnSpecOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ flex: '1 1 140px', minWidth: 120 }}>
              <TextField select fullWidth size="small" label="横梁系列" value={profileConfig.beamSeries}
                onChange={(e) => setProfileConfig({ ...profileConfig, beamSeries: e.target.value, beamSpec: '' })}>
                {beamSeriesOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
              <TextField select fullWidth size="small" label="横梁规格" value={profileConfig.beamSpec}
                onChange={(e) => setProfileConfig({ ...profileConfig, beamSpec: e.target.value })}>
                <MenuItem value="">请选择</MenuItem>
                {beamSpecOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Box>
          </Box>
          {(profileConfig.columnSpec || profileConfig.beamSpec) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {profileConfig.columnSpec && <Chip size="small" color="primary" label={`立柱: ${profileConfig.columnSpec}`} />}
              {profileConfig.beamSpec && <Chip size="small" color="secondary" label={`横梁: ${profileConfig.beamSpec}`} />}
            </Box>
          )}

          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">参数模板（定义配置时的输入参数）</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addParam}>添加参数</Button>
          </Box>

          {form.parameterTemplate.map((param, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 120px', minWidth: 100 }}>
                <FormDrawer.TextField label="参数键(key)" value={param.key} onChange={(v) => updateParam(idx, 'key', v)} required />
              </Box>
              <Box sx={{ flex: '1 1 120px', minWidth: 100 }}>
                <FormDrawer.TextField label="显示名(label)" value={param.label} onChange={(v) => updateParam(idx, 'label', v)} required />
              </Box>
              <Box sx={{ flex: '0 0 100px' }}>
                <FormDrawer.Select label="类型" value={param.type} onChange={(v) => updateParam(idx, 'type', v)} options={PARAM_TYPES.map((t) => ({ label: t, value: t }))} />
              </Box>
              <Box sx={{ flex: '0 0 80px' }}>
                <FormDrawer.TextField label="单位" value={param.unit || ''} onChange={(v) => updateParam(idx, 'unit', v)} />
              </Box>
              {param.type === 'number' && (
                <>
                  <Box sx={{ flex: '0 0 70px' }}>
                    <FormDrawer.TextField label="最小值" value={String(param.min ?? '')} onChange={(v) => updateParam(idx, 'min', Number(v) || 0)} />
                  </Box>
                  <Box sx={{ flex: '0 0 70px' }}>
                    <FormDrawer.TextField label="最大值" value={String(param.max ?? '')} onChange={(v) => updateParam(idx, 'max', Number(v) || 0)} />
                  </Box>
                </>
              )}
              {param.type === 'select' && (
                <Box sx={{ flex: '1 1 200px' }}>
                  <FormDrawer.TextField label="选项(逗号分隔)" value={(param.options || []).join(',')} onChange={(v) => updateParam(idx, 'options', v)} />
                  <Typography variant="caption" color="text.secondary">如: 橙色,蓝色,灰色</Typography>
                </Box>
              )}
              <IconButton size="small" color="error" onClick={() => removeParam(idx)}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
        </Box>
      </FormDrawer>
      <ConfirmDialog open={!!deleteItem} title="确认删除" content={`确定要删除货架类型 "${deleteItem?.name}" 吗？此操作不可撤销。`} onConfirm={async () => { if (deleteItem) { await removeShelfType(deleteItem.id); setDeleteItem(null); onSuccess('删除成功'); } }} onCancel={() => setDeleteItem(null)} />
    </Box>
  );
}
