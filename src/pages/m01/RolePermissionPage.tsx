import { useState, useEffect } from 'react';
import { Box, Paper, List, ListItemButton, ListItemText, Typography, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM01Store } from '@/stores/useM01Store';
import PermissionMatrix from './components/PermissionMatrix';

export default function RolePermissionPage() {
  const { roles, loading, error, fetchRoles, createRole, updateRole } = useM01Store();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  useEffect(() => { if (roles.length && !selectedRoleId) setSelectedRoleId(roles[0].id); }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="角色权限" subtitle="管理角色及四维权限矩阵" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          createRole({ name: '新角色', code: 'NEW_ROLE', description: '', permissionIds: [], status: 'active' });
        }} sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          新增角色
        </Button>
      } />
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 180px)' }}>
        <Paper variant="outlined" sx={{ width: 260, overflow: 'auto', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="#005591" fontWeight={700} sx={{ p: 2, pb: 1 }}>角色列表</Typography>
          <List dense>
            {roles.map((role) => (
              <ListItemButton key={role.id} selected={role.id === selectedRoleId}
                onClick={() => setSelectedRoleId(role.id)}
                sx={{ '&.Mui-selected': { backgroundColor: '#E3F2FD', borderRight: '3px solid #005591' } }}>
                <ListItemText primary={role.name} secondary={role.code} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 2, overflow: 'auto', borderRadius: 2 }}>
          {selectedRole ? (
            <PermissionMatrix
              role={selectedRole}
              onSave={(permissionIds) => updateRole(selectedRole.id, { permissionIds })}
            />
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>请在左侧选择角色</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
