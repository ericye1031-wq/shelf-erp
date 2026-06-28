import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, FormControlLabel, Switch } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useM17Store } from '../../stores/useM17Store';

export default function KpiListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    kpiNo: '',
    name: '',
    description: '',
    type: 'custom' as string,
    unit: 'count' as string,
    calculation: '',
    target: 0,
    actual: 0,
    achievementRate: 0,
    trend: 'flat' as string,
    trendValue: '',
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
  });

  const {
    kpis,
    kpiTotal,
    kpiLoading,
    fetchKPIs,
    createKPI,
    updateKPI,
    deleteKPI,
  } = useM17Store();

  useEffect(() => {
    fetchKPIs({ page: page + 1, pageSize });
  }, [page, pageSize]);

  const handleOpenDialog = (id?: number) => {
    if (id) {
      const item = kpis.find((k) => k.id === id);
      if (item) {
        setForm({
          kpiNo: item.kpiNo,
          name: item.name,
          description: item.description || '',
          type: item.type,
          unit: item.unit,
          calculation: item.calculation,
          target: item.target || 0,
          actual: item.actual,
          achievementRate: item.achievementRate || 0,
          trend: item.trend,
          trendValue: item.trendValue || '',
          isActive: item.isActive,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy || '',
        });
        setEditing(id);
      }
    } else {
      setForm({
        kpiNo: `KPI202606${String(Date.now()).slice(-3)}`,
        name: '',
        description: '',
        type: 'custom',
        unit: 'count',
        calculation: '',
        target: 0,
        actual: 0,
        achievementRate: 0,
        trend: 'flat',
        trendValue: '',
        isActive: true,
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
      await updateKPI(editing, form);
    } else {
      await createKPI(form);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定删除此KPI指标？')) {
      await deleteKPI(id);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">KPI指标管理</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            新建KPI指标
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>编号</TableCell>
                <TableCell>名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>单位</TableCell>
                <TableCell>目标值</TableCell>
                <TableCell>实际值</TableCell>
                <TableCell>达成率</TableCell>
                <TableCell>趋势</TableCell>
                <TableCell>是否启用</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpis.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>{k.kpiNo}</TableCell>
                  <TableCell>{k.name}</TableCell>
                  <TableCell>
                    <Chip label={k.type} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={k.unit} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>{k.target}</TableCell>
                  <TableCell>{k.actual}</TableCell>
                  <TableCell>{k.achievementRate}%</TableCell>
                  <TableCell>
                    <Chip 
                      label={k.trend} 
                      size="small" 
                      color={k.trend === 'up' ? 'success' : k.trend === 'down' ? 'error' : 'default'} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={k.isActive ? '是' : '否'} size="small" color={k.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/m17/kpis/${k.id}`)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(k.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(k.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            count={kpiTotal}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          />
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editing ? '编辑KPI指标' : '新建KPI指标'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              请填写KPI指标信息
            </DialogContentText>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
              <TextField
                label="KPI编号"
                value={form.kpiNo}
                onChange={(e) => setForm({ ...form, kpiNo: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="KPI名称"
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
              <TextField
                select
                label="单位"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                fullWidth
                margin="normal"
              >
                <option value="count">数量</option>
                <option value="amount">金额</option>
                <option value="percentage">百分比</option>
                <option value="days">天数</option>
                <option value="ratio">比率</option>
              </TextField>
              <TextField
                label="计算方式"
                value={form.calculation}
                onChange={(e) => setForm({ ...form, calculation: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="目标值"
                type="number"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="实际值"
                type="number"
                value={form.actual}
                onChange={(e) => setForm({ ...form, actual: parseFloat(e.target.value) })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="达成率(%)"
                type="number"
                value={form.achievementRate}
                onChange={(e) => setForm({ ...form, achievementRate: parseFloat(e.target.value) })}
                fullWidth
                margin="normal"
              />
              <TextField
                select
                label="趋势"
                value={form.trend}
                onChange={(e) => setForm({ ...form, trend: e.target.value })}
                fullWidth
                margin="normal"
              >
                <option value="up">上升</option>
                <option value="down">下降</option>
                <option value="flat">持平</option>
              </TextField>
              <TextField
                label="趋势值"
                value={form.trendValue}
                onChange={(e) => setForm({ ...form, trendValue: e.target.value })}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                }
                label="是否启用"
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
