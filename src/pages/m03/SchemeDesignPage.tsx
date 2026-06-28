import { useEffect, useState, useCallback } from 'react';
import {
  Box, Alert, Button, Chip, IconButton, Tooltip, Typography,
  Collapse, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Card, CardContent,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import FormDrawer from '@/components/common/FormDrawer';
import { useM03Store } from '@/stores/useM03Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { Scheme, SchemeVersion } from '@/types/m03';

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', submitted: '已提交', approved: '已批准', rejected: '已驳回',
};
const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error'> = {
  draft: 'default', submitted: 'primary', approved: 'success', rejected: 'error',
};

const columns: Column<Scheme>[] = [
  { id: 'code', label: '方案编号', sortable: true, width: 140 },
  { id: 'name', label: '方案名称', minWidth: 180 },
  { id: 'rackType', label: '货架类型', width: 120, render: (r) => r.rackType || '-' },
  { id: 'currentVersion', label: '当前版本', width: 90, align: 'center' },
  {
    id: 'status', label: '状态', width: 90,
    render: (r) => <StatusBadge status={r.status} label={STATUS_LABELS[r.status] || r.status} />,
  },
  {
    id: 'createdAt', label: '创建时间', width: 160,
    render: (r) => formatDate(r.createdAt),
  },
];

/** 单个方案的展开行：版本列表 */
function SchemeExpandRow({ scheme, onApprove }: {
  scheme: Scheme;
  onApprove: (versionId: string) => void;
}) {
  const { versions, fetchVersions, loading } = useM03Store();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && scheme.id) {
      await fetchVersions(scheme.id);
    }
  }, [expanded, scheme.id, fetchVersions]);

  const filteredVersions = Array.isArray(versions)
    ? versions.filter((v: SchemeVersion) => v.schemeId === scheme.id)
    : [];

  return (
    <>
      <TableRow hover>
        <TableCell />
        {columns.map((col) => {
          if (col.id === 'actions-col') return <TableCell key={col.id} />;
          return null;
        })}
        <TableCell>
          <Button size="small" startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={handleToggle}>
            版本 ({filteredVersions.length})
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ p: 0, borderBottom: 0 }} colSpan={columns.length + 1}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                版本历史 — {scheme.code}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>版本号</TableCell>
                    <TableCell>变更说明</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>审批人</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVersions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">暂无版本记录</TableCell>
                    </TableRow>
                  ) : (
                    filteredVersions.map((v: SchemeVersion) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.versionNo}</TableCell>
                        <TableCell>{v.changeSummary || '-'}</TableCell>
                        <TableCell>
                          <Chip label={v.status === 'approved' ? '已审批' : '待审批'} size="small"
                            color={v.status === 'approved' ? 'success' : 'warning'} />
                        </TableCell>
                        <TableCell>{v.approvedBy || '-'}</TableCell>
                        <TableCell>{formatDate(v.createdAt)}</TableCell>
                        <TableCell>
                          {v.status !== 'approved' && (
                            <Button size="small" variant="outlined" onClick={() => onApprove(v.id)}>
                              审批通过
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function SchemeDesignPage() {
  const { schemes, loading, error, fetchSchemes, createScheme, removeScheme, createVersion, approveVersion } = useM03Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [createOpen, setCreateOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [drawingDialogOpen, setDrawingDialogOpen] = useState(false);
  const [drawingUrl, setDrawingUrl] = useState('');

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  /** 新建方案表单 */
  const [form, setForm] = useState({ code: '', name: '', rackType: '', description: '' });
  const handleFormChange = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  /** 新建版本表单 */
  const [verForm, setVerForm] = useState({ versionNo: '', changeSummary: '', attachments: '' });
  const handleVerChange = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVerForm((p) => ({ ...p, [f]: e.target.value }));

  const handleCreateScheme = async () => {
    if (!form.code || !form.name) { onError('请填写方案编号和名称'); return; }
    try {
      useM03Store.setState({ error: null });
      await createScheme(form);
      const err = useM03Store.getState().error;
      if (err) { onError(err); } else { onSuccess('方案创建成功'); setCreateOpen(false); setForm({ code: '', name: '', rackType: '', description: '' }); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const handleCreateVersion = async () => {
    if (!selectedSchemeId || !verForm.versionNo) { onError('请填写版本号'); return; }
    try {
      useM03Store.setState({ error: null });
      await createVersion(selectedSchemeId, verForm);
      const err = useM03Store.getState().error;
      if (err) { onError(err); } else { onSuccess('版本创建成功'); setVersionOpen(false); setVerForm({ versionNo: '', changeSummary: '', attachments: '' }); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const handleApproveVersion = async (versionId: string) => {
    try {
      useM03Store.setState({ error: null });
      await approveVersion(versionId, '当前用户');
      const err = useM03Store.getState().error;
      if (err) { onError(err); } else { onSuccess('版本已审批'); }
    } catch (e) { onError(e instanceof Error ? e.message : String(e)); }
  };

  const handleOpenDrawing = (scheme: Scheme) => {
    const url = `/m03/drawings?schemeId=${scheme.id}`;
    setDrawingUrl(url);
    setDrawingDialogOpen(true);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PageHeader
        title="方案设计管理"
        subtitle={`共 ${schemes.length} 个方案`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setSelectedSchemeId(''); setVersionOpen(true); }}>
              新建版本
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ backgroundColor: '#005591' }}>
              新建方案
            </Button>
          </Box>
        }
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              {columns.map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
              ))}
              <TableCell width={200} sx={{ fontWeight: 600 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schemes.map((scheme) => {
              const handleDelete = async () => {
                if (!window.confirm(`确定删除方案「${scheme.code}」？`)) return;
                useM03Store.setState({ error: null });
                await removeScheme(scheme.id);
                const err = useM03Store.getState().error;
                if (err) { onError(err); } else { onSuccess('方案已删除'); }
              };

              return (
                <>
                  <TableRow key={scheme.id} hover>
                    <TableCell />
                    <TableCell>{scheme.code}</TableCell>
                    <TableCell>{scheme.name}</TableCell>
                    <TableCell>{scheme.rackType || '-'}</TableCell>
                    <TableCell align="center">{scheme.currentVersion}</TableCell>
                    <TableCell>
                      <StatusBadge status={scheme.status} label={STATUS_LABELS[scheme.status] || scheme.status} />
                    </TableCell>
                    <TableCell>{formatDate(scheme.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="查看图纸">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDrawing(scheme)}>
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="新建版本">
                          <IconButton size="small" color="primary" onClick={() => { setSelectedSchemeId(scheme.id); setVersionOpen(true); }}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除">
                          <IconButton size="small" color="error" onClick={handleDelete}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <SchemeExpandRow scheme={scheme} onApprove={handleApproveVersion} />
                </>
              );
            })}
            {schemes.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center" sx={{ py: 4 }}>
                  暂无方案数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新建方案 Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新建方案</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="方案编号" value={form.code} onChange={handleFormChange('code')} size="small" required fullWidth />
            <TextField label="方案名称" value={form.name} onChange={handleFormChange('name')} size="small" required fullWidth />
            <TextField label="货架类型" value={form.rackType} onChange={handleFormChange('rackType')} size="small" fullWidth />
            <TextField label="描述" value={form.description} onChange={handleFormChange('description')} size="small" multiline rows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateScheme} sx={{ backgroundColor: '#005591' }}>创建</Button>
        </DialogActions>
      </Dialog>

      {/* 新建版本 Dialog */}
      <Dialog open={versionOpen} onClose={() => setVersionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新建版本</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="版本号" value={verForm.versionNo} onChange={handleVerChange('versionNo')} size="small" required fullWidth />
            <TextField label="变更说明" value={verForm.changeSummary} onChange={handleVerChange('changeSummary')} size="small" multiline rows={2} fullWidth />
            <TextField label="附件 (URL)" value={verForm.attachments} onChange={handleVerChange('attachments')} size="small" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateVersion} sx={{ backgroundColor: '#005591' }}>创建</Button>
        </DialogActions>
      </Dialog>

      {/* 图纸跳转确认 */}
      <Dialog open={drawingDialogOpen} onClose={() => setDrawingDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>跳转到图纸管理</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            将打开该方案的关联图纸页面。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrawingDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => { window.open(drawingUrl, '_self'); }}
            sx={{ backgroundColor: '#005591' }}>
            前往
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
