import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, FormControlLabel, Switch } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Cable as TestIcon } from '@mui/icons-material';
import { useM17Store } from '../../stores/useM17Store';

export default function DataSourceListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    sourceNo: '',
    name: '',
    description: '',
    type: 'sqlite' as string,
    connectionString: '',
    config: '',
    isActive: true,
    isDefault: false,
    createdBy: 'admin',
    updatedBy: 'admin',
  });

  const {
    dataSources,
    dataSourceTotal,
    dataSourceLoading,
    fetchDataSources,
    createDataSource,
    updateDataSource,
    deleteDataSource,
  } = useM17Store();

  useEffect(() => {
    fetchDataSources({ page: page + 1, pageSize });
  }, [page, pageSize]);

  const handleOpenDialog = (id?: number) => {
    if (id) {
      const item = dataSources.find((d) => d.id === id);
      if (item) {
        setForm({
          sourceNo: item.sourceNo,
          name: item.name,
          description: item.description || '',
          type: item.type,
          connectionString: item.connectionString || '',
          config: item.config ? JSON.stringify(item.config) : '',
          isActive: item.isActive,
          isDefault: item.isDefault,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy || '',
        });
        setEditing(id);
      }
    } else {
      setForm({
        sourceNo: `DS202606${String(Date.now()).slice(-3)}`,
        name: '',
        description: '',
        type: 'sqlite',
        connectionString: '',
        config: '',
        isActive: true,
        isDefault: false,
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
    const payload = {
      ...form,
      config: form.config ? JSON.parse(form.config) : null,
    };
    if (editing) {
      await updateDataSource(editing, payload);
    } else {
      await createDataSource(payload);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定删除此数据源？')) {
      await deleteDataSource(id);
    }
  };

  const handleTestConnection = async (id: number) => {
    alert('测试连接功能待实现');
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">数据源管理</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            新建数据源
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>编号</TableCell>
                <TableCell>名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>连接字符串</TableCell>
                <TableCell>是否默认</TableCell>
                <TableCell>是否启用</TableCell>
                <TableCell>最后测试</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataSources.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.sourceNo}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    <Chip label={d.type} size="small" color="primary" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.connectionString || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip label={d.isDefault ? '是' : '否'} size="small" color={d.isDefault ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={d.isActive ? '是' : '否'} size="small" color={d.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    {d.lastTestAt ? (
                      <Box>
                        <Typography variant="caption">{new Date(d.lastTestAt).toLocaleDateString()}</Typography>
                        <Chip 
                          label={d.lastTestSuccess ? '成功' : '失败'} 
                          size="small" 
                          color={d.lastTestSuccess ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">未测试</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => navigate(`/m17/data-sources/${d.id}`)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleTestConnection(d.id)}>
                      <TestIcon fontSize="small" />
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
            count={dataSourceTotal}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          />
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editing ? '编辑数据源' : '新建数据源'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              请填写数据源信息
            </DialogContentText>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
              <TextField
                label="数据源编号"
                value={form.sourceNo}
                onChange={(e) => setForm({ ...form, sourceNo: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="数据源名称"
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
                <option value="sqlite">SQLite</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlserver">SQL Server</option>
                <option value="oracle">Oracle</option>
                <option value="api">API</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </TextField>
              <TextField
                label="连接字符串"
                value={form.connectionString}
                onChange={(e) => setForm({ ...form, connectionString: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="配置(JSON)"
                value={form.config}
                onChange={(e) => setForm({ ...form, config: e.target.value })}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                helperText="请输入有效的JSON格式"
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
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  />
                }
                label="是否默认"
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
