import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, Button, Paper } from '@mui/material';
import type { Role } from '@/types/m01';

/** 四维权限维度 */
const DIMENSIONS = ['功能权限', '数据权限', '审批权限', '字段权限'] as const;

/** 模拟权限模块 */
const MODULES = ['客户管理', '商机管理', '询价管理', '报价管理', '合同管理', '项目管理', 'BOM管理', '生产管理', '仓储管理', '成本管理', '系统管理'];

interface PermissionMatrixProps {
  role: Role;
  onSave: (permissionIds: string[]) => void;
}

export default function PermissionMatrix({ role, onSave }: PermissionMatrixProps) {
  const [tab, setTab] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    role.permissionIds.forEach((id) => { map[id] = true; });
    return map;
  });

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (module: string) => {
    const keys = DIMENSIONS.map((_, di) => `${module}_${di}`);
    const allChecked = keys.every((k) => checked[k]);
    setChecked((prev) => {
      const next = { ...prev };
      keys.forEach((k) => { next[k] = !allChecked; });
      return next;
    });
  };

  const handleSave = () => {
    const ids = Object.entries(checked).filter(([, v]) => v).map(([k]) => k);
    onSave(ids);
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} color="#005591" sx={{ mb: 1 }}>{role.name} - 权限矩阵</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ borderBottom: '1px solid #E0E0E0', mb: 2 }}>
        {DIMENSIONS.map((d, i) => <Tab key={d} label={d} sx={{ fontWeight: tab === i ? 700 : 400 }} />)}
      </Tabs>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 700, color: '#005591' }}>模块</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#005591', width: 80 }}>查看</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#005591', width: 80 }}>新增</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#005591', width: 80 }}>编辑</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#005591', width: 80 }}>删除</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MODULES.map((mod) => (
              <TableRow key={mod} hover>
                <TableCell>
                  <Checkbox size="small" checked={[0,1,2,3].every((di) => checked[`${mod}_${di}`])}
                    onChange={() => toggleAll(mod)} sx={{ mr: 0.5 }} />
                  {mod}
                </TableCell>
                {[0,1,2,3].map((di) => {
                  const key = `${mod}_${di}`;
                  return (
                    <TableCell key={key} align="center">
                      <Checkbox size="small" checked={!!checked[key]} onChange={() => toggle(key)}
                        sx={{ color: '#2271B3', '&.Mui-checked': { color: '#005591' } }} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#005591', '&:hover': { backgroundColor: '#004477' } }}>
          保存权限
        </Button>
      </Box>
    </Box>
  );
}
