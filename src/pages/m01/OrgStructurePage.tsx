import { useState, useMemo, useEffect } from 'react';
import { Box, Paper, Typography, Button, Stack, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '@/components/common/PageHeader';
import TreeView, { TreeDataItem } from '@/components/shared/TreeView';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM01Store } from '@/stores/useM01Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import OrgTreeDialog from './components/OrgTreeDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusBadge from '@/components/common/StatusBadge';
import { BIZ_STATUS_MAP } from '@/utils/constants';

export default function OrgStructurePage() {
  const { organizations, loading, error, fetchOrganizations, removeOrg } = useM01Store();
  const { onSuccess } = useCrudFeedback();
  const [selectedId, setSelectedId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);

  const treeData = useMemo<TreeDataItem[]>(() => {
    const map = new Map<string, TreeDataItem>();
    organizations.forEach((o) => map.set(o.id, { id: o.id, name: o.name }));
    const roots: TreeDataItem[] = [];
    organizations.forEach((o) => {
      const node = map.get(o.id)!;
      if (o.parentId && map.has(o.parentId)) {
        const parent = map.get(o.parentId)!;
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [organizations]);

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader
        title="组织架构"
        subtitle="管理公司、工厂、仓库等组织节点"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setDialogOpen(true); }}
            sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
            新增节点
          </Button>
        }
      />
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 180px)' }}>
        <Paper variant="outlined" sx={{ width: 300, p: 2, overflow: 'auto', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="#005591" fontWeight={700} sx={{ mb: 1 }}>组织树</Typography>
          <TreeView data={treeData} selectedId={selectedId} onSelect={setSelectedId} defaultExpandAll />
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          {selectedOrg ? (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="#005591">{selectedOrg.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<EditIcon />} sx={{ color: '#2271B3' }}
                    onClick={() => { setEditId(selectedOrg.id); setDialogOpen(true); }}>编辑</Button>
                  <Button size="small" startIcon={<DeleteIcon />} color="error"
                    onClick={() => setDeleteId(selectedOrg.id)}>删除</Button>
                </Stack>
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="body2"><strong>编码：</strong>{selectedOrg.code}</Typography>
                <Typography variant="body2"><strong>类型：</strong>{selectedOrg.type}</Typography>
                <Typography variant="body2"><strong>联系人：</strong>{selectedOrg.contact}</Typography>
                <Typography variant="body2"><strong>电话：</strong>{selectedOrg.phone}</Typography>
                <Typography variant="body2"><strong>地址：</strong>{selectedOrg.address}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2"><strong>状态：</strong></Typography>
                  <StatusBadge status={selectedOrg.status} label={BIZ_STATUS_MAP[selectedOrg.status]} />
                </Box>
              </Stack>
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>请在左侧选择组织节点</Typography>
          )}
        </Paper>
      </Box>
      <OrgTreeDialog open={dialogOpen} editId={editId} onClose={() => setDialogOpen(false)} />
      <ConfirmDialog open={!!deleteId} title="删除确认" content="确定要删除该组织节点吗？"
        confirmColor="error" onConfirm={async () => { if (deleteId) { await removeOrg(deleteId); setDeleteId(null); setSelectedId(''); onSuccess('删除成功'); } }}
        onCancel={() => setDeleteId(null)} />
    </Box>
  );
}
