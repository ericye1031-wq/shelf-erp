import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from '@mui/material';
import { useM01Store } from '@/stores/useM01Store';
import { Checkbox, FormControlLabel } from '@mui/material';

interface UserAssignDialogProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
}

export default function UserAssignDialog({ open, userId, onClose }: UserAssignDialogProps) {
  const { users, roles, fetchUsers, fetchRoles, updateUser } = useM01Store();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) { fetchUsers(); fetchRoles(); }
  }, [open, fetchUsers, fetchRoles]);

  const user = userId ? users.find((u) => u.id === userId) : null;

  useEffect(() => {
    if (user) setSelectedRoleIds(user.roleIds);
  }, [user]);

  const handleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = () => {
    if (userId) {
      updateUser(userId, { roleIds: selectedRoleIds });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#005591', fontWeight: 700 }}>分配角色 — {user?.name ?? ''}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>勾选需要分配的角色：</Typography>
        <Stack spacing={0.5}>
          {roles.map((role) => (
            <FormControlLabel key={role.id} control={
              <Checkbox checked={selectedRoleIds.includes(role.id)} onChange={() => handleToggle(role.id)}
                sx={{ color: '#2271B3', '&.Mui-checked': { color: '#005591' } }} />
            } label={`${role.name} (${role.code})`} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>取消</Button>
        <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
