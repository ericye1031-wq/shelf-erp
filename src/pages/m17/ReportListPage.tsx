import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useM17Store } from '../../stores/useM17Store';

export default function ReportListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    reportNo: '',
    name: '',
    description: '',
    type: 'custom' as string,
    format: 'table' as string,
    sqlQuery: '',
    parameters: {} as any,
    columns: [] as any[],
    filters: [] as any[],
    chartConfig: {} as any,
    isPublic: false,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
  });

  const {
    reports,
    reportTotal,
    reportLoading,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
  } = useM17Store();

  useEffect(() => {
    fetchReports({ page: page + 1, pageSize });
  }, [page, pageSize]);

  const handleOpenDialog = (id?: number) => {
    if (id) {
      const item = reports.find((r) => r.id === id);
      if (item) {
        setForm({
          reportNo: item.reportNo,
          name: item.name,
          description: item.description || '',
          type: item.type,
          format: item.format,
          sqlQuery: item.sqlQuery || '',
          parameters: item.parameters || {},
          columns: item.columns || [],
          filters: item.filters || [],
          chartConfig: item.chartConfig || {},
          isPublic: item.isPublic,
          isActive: item.isActive,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy || '',
        });
        setEditing(id);
      }
    } else {
      setForm({
        reportNo: `RPT202606${String(Date.now()).slice(-3)}`,
        name: '',
        description: '',
        type: 'custom',
        format: 'table',
        sqlQuery: '',
        parameters: {},
        columns: [],
        filters: [],
        chartConfig: {},
        isPublic: false,
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
      await updateReport(editing, form);
    } else {
      await createReport(form);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定删除此报表？')) {
      await deleteReport(id);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">报表管理</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            新建报表
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>编号</TableCell>
                <TableCell>名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>格式</TableCell>
                <TableCell>是否公开</TableCell>
                <TableCell>是否启用</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.reportNo}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>
                    <Chip label={r.type} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.format} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.isPublic ? '是' : '否'} size="small" color={r.isPublic ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.isActive ? '是' : '否'} size="small" color={r.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/m17/reports/${r.id}`)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(r.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            count={reportTotal}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          />
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editing ? '编辑报表' : '新建报表'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              请填写报表信息
            </DialogContentText>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
              <TextField
                label="报表编号"
                value={form.reportNo}
                onChange={(e) => setForm({ ...form, reportNo: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="报表名称"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                select
                label="类型"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                fullWidth
                margin="normal"
              >
                <MenuItem value="sales">销售</MenuItem>
                <MenuItem value="purchase">采购</MenuItem>
                <MenuItem value="inventory">库存</MenuItem>
                <MenuItem value="finance">财务</MenuItem>
                <MenuItem value="project">项目</MenuItem>
                <MenuItem value="custom">自定义</MenuItem>
              </TextField>
              <TextField
                select
                label="格式"
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                fullWidth
                margin="normal"
              >
                <MenuItem value="table">表格</MenuItem>
                <MenuItem value="chart">图表</MenuItem>
                <MenuItem value="pivot">透视表</MenuItem>
                <MenuItem value="summary">汇总</MenuItem>
              </TextField>
              <TextField
                label="SQL查询"
                value={form.sqlQuery}
                onChange={(e) => setForm({ ...form, sqlQuery: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isPublic}
                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                  />
                }
                label="是否公开"
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
