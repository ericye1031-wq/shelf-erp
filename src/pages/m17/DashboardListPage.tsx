import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, Grid, Switch, FormControlLabel } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useM17Store } from '../../stores/useM17Store';

export default function DashboardListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    dashboardNo: '',
    name: '',
    description: '',
    type: 'custom' as string,
    layout: {} as any,
    widgets: [] as any[],
    isPublic: false,
    createdBy: 'admin',
    updatedBy: 'admin',
  });

  const {
    dashboards,
    dashboardTotal,
    dashboardLoading,
    fetchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
  } = useM17Store();

  useEffect(() => {
    fetchDashboards({ page: page + 1, pageSize });
  }, [page, pageSize]);

  const handleOpenDialog = (id?: number) => {
    if (id) {
      const item = dashboards.find((d) => d.id === id);
      if (item) {
        setForm({
          dashboardNo: item.dashboardNo,
          name: item.name,
          description: item.description || '',
          type: item.type,
          layout: item.layout || {},
          widgets: item.widgets || [],
          isPublic: item.isPublic,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy || '',
        });
        setEditing(id);
      }
    } else {
      setForm({
        dashboardNo: `DASH202606${String(Date.now()).slice(-3)}`,
        name: '',
        description: '',
        type: 'custom',
        layout: { cols: 12, rows: 8, compact: true },
        widgets: [],
        isPublic: false,
        createdBy: 'admin',
        updatedBy: 'admin',
      });
      setEditing(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (editing) {
      await updateDashboard(editing, form);
    } else {
      await createDashboard(form);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定删除此仪表板？')) {
      await deleteDashboard(id);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">仪表板管理</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            新建仪表板
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>编号</TableCell>
                <TableCell>名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>是否公开</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboards.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.dashboardNo}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    <Chip label={d.type} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={d.isPublic} disabled />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/m17/dashboards/${d.id}`)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(d.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(d.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            count={dashboardTotal}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          />
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editing ? '编辑仪表板' : '新建仪表板'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              请填写仪表板信息
            </DialogContentText>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
              <TextField
                label="仪表板编号"
                value={form.dashboardNo}
                onChange={(e) => setForm({ ...form, dashboardNo: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="仪表板名称"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="描述"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                select
                label="类型"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                fullWidth
                margin="normal"
              >
                <option value="sales">销售</option>
                <option value="purchase">采购</option>
                <option value="inventory">库存</option>
                <option value="finance">财务</option>
                <option value="project">项目</option>
                <option value="custom">自定义</option>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isPublic}
                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                  />
                }
                label="是否公开"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>取消</Button>
            <Button onClick={handleSave} variant="contained">保存</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
