import { useState, useEffect } from 'react';
import { Box, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import DataTable, { Column } from '@/components/common/DataTable';
import FormDrawer from '@/components/common/FormDrawer';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM01Store } from '@/stores/useM01Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { BIZ_STATUS_MAP } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import type { User } from '@/types/m01';
import { TextField, MenuItem, Stack } from '@mui/material';

const columns: Column<User>[] = [
  { id: 'username', label: '用户名', sortable: true },
  { id: 'name', label: '姓名', sortable: true },
  { id: 'phone', label: '手机', width: 130 },
  { id: 'email', label: '邮箱', width: 180 },
  { id: 'orgName', label: '组织', width: 120 },
  { id: 'roleIds', label: '角色', width: 100, render: (r) => r.roleIds?.length ? `${r.roleIds.length}个角色` : '-' },
  { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={BIZ_STATUS_MAP[r.status]} /> },
  { id: 'audit', label: '最后登录', width: 150, render: (r) => formatDate(r.audit?.updatedAt ?? '') },
];

export default function UserListPage() {
  const { users, loading, error, fetchUsers, createUser } = useM01Store();
  const { onSuccess } = useCrudFeedback();
  const [keyword, setKeyword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) =>
    u.name.includes(keyword) || u.username.includes(keyword) || u.phone.includes(keyword)
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="用户管理" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)}
          sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          新增用户
        </Button>
      } />
      <SearchBar placeholder="搜索用户名/姓名/手机" value={keyword} onChange={setKeyword} />
      <DataTable columns={columns} rows={filtered} />
      <FormDrawer open={drawerOpen} title="新增用户" onCancel={() => setDrawerOpen(false)} onSubmit={() => {
        createUser({ username: 'new_user', name: '新用户', phone: '', email: '', orgId: '', roleIds: [], status: 'active' });
        setDrawerOpen(false);
        onSuccess('用户创建成功');
      }}>
        <UserFormFields />
      </FormDrawer>
    </Box>
  );
}

function UserFormFields() {
  const { organizations, roles } = useM01Store();
  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="用户名" size="small" fullWidth required />
      <TextField label="姓名" size="small" fullWidth required />
      <TextField label="手机" size="small" fullWidth />
      <TextField label="邮箱" size="small" fullWidth />
      <TextField label="组织" size="small" fullWidth select>
        {organizations.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
      </TextField>
      <TextField label="角色" size="small" fullWidth select SelectProps={{ multiple: true }}>
        {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
      </TextField>
    </Stack>
  );
}
