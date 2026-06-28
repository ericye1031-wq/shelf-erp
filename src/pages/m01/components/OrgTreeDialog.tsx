import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, MenuItem } from '@mui/material';
import { useM01Store } from '@/stores/useM01Store';
import type { Organization } from '@/types/m01';

interface OrgTreeDialogProps {
  open: boolean;
  editId: string | null;
  onClose: () => void;
}

const ORG_TYPES: Organization['type'][] = ['group', 'company', 'factory', 'department'];
const ORG_TYPE_LABELS: Record<string, string> = { group: '集团', company: '公司', factory: '工厂', department: '部门' };

export default function OrgTreeDialog({ open, editId, onClose }: OrgTreeDialogProps) {
  const { organizations, createOrg, updateOrg } = useM01Store();
  const editOrg = editId ? organizations.find((o) => o.id === editId) : null;

  const [form, setForm] = useState({ name: '', code: '', type: 'company' as Organization['type'], contact: '', phone: '', address: '' });

  useEffect(() => {
    if (editOrg) {
      setForm({ name: editOrg.name, code: editOrg.code, type: editOrg.type, contact: editOrg.contact, phone: editOrg.phone, address: editOrg.address });
    } else {
      setForm({ name: '', code: '', type: 'company', contact: '', phone: '', address: '' });
    }
  }, [editOrg, open]);

  const handleSubmit = () => {
    const data = { ...form, parentId: null, status: 'active' as const, sort: 0 };
    if (editId) {
      updateOrg(editId, data);
    } else {
      createOrg(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#005591', fontWeight: 700 }}>{editId ? '编辑组织' : '新增组织'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="名称" size="small" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="编码" size="small" fullWidth required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <TextField label="类型" size="small" fullWidth select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Organization['type'] })}>
            {ORG_TYPES.map((t) => <MenuItem key={t} value={t}>{ORG_TYPE_LABELS[t]}</MenuItem>)}
          </TextField>
          <TextField label="联系人" size="small" fullWidth value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <TextField label="电话" size="small" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="地址" size="small" fullWidth value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>取消</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
