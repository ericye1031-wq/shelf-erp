import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Alert, Button, Tabs, Tab, Paper, Grid, Card, CardContent,
  Typography, Chip, Stack,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM03Store } from '@/stores/useM03Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Drawing, DrawingCategory, DrawingStatus } from '@/types/m03';

const categoryLabel: Record<string, string> = {
  assembly: '总装图',
  component: '部件图',
  part: '零件图',
  installation: '安装图',
  foundation: '基础图',
};

const statusLabel: Record<string, string> = {
  designing: '设计中',
  reviewing: '待审核',
  published: '已发布',
  obsolete: '已废止',
};

const categoryList: { value: DrawingCategory | '', label: string }[] = [
  { value: '', label: '全部' },
  { value: 'assembly', label: '总装图' },
  { value: 'component', label: '部件图' },
  { value: 'part', label: '零件图' },
  { value: 'installation', label: '安装图' },
  { value: 'foundation', label: '基础图' },
];

const columns: Column<Drawing>[] = [
  { id: 'code', label: '图纸编号', sortable: true, width: 160 },
  { id: 'name', label: '图纸名称', minWidth: 180 },
  {
    id: 'category',
    label: '分类',
    width: 100,
    render: (r) => categoryLabel[(r as Drawing).category] || (r as Drawing).category,
  },
  {
    id: 'status',
    label: '状态',
    width: 90,
    render: (r) => (
      <StatusBadge
        status={(r as Drawing).status}
        label={statusLabel[(r as Drawing).status] || (r as Drawing).status}
      />
    ),
  },
  { id: 'version', label: '版本', width: 70, align: 'center' },
  {
    id: 'fileType',
    label: '文件类型',
    width: 90,
  },
  {
    id: 'uploadedAt',
    label: '上传时间',
    width: 160,
    render: (r) => new Date((r as Drawing).uploadedAt).toLocaleString(),
  },
];

export default function DrawingManagePage() {
  const navigate = useNavigate();
  const { drawings, loading, error, fetchDrawings, removeDrawing } = useM03Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<DrawingCategory | ''>('');

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const filteredDrawings = category
    ? drawings.filter((d) => d.category === category)
    : drawings;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PageHeader
        title="图文档管理"
        action={
          <Button
            variant="contained"
            onClick={() => navigate('/m03/drawings/new')}
          >
            上传图纸
          </Button>
        }
      />

      {/* 分类筛选 Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={category}
          onChange={(_, v) => setCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categoryList.map((c) => (
            <Tab key={c.value} label={c.label} value={c.value} />
          ))}
        </Tabs>
      </Paper>

      {/* 图纸列表 */}
      <DataTable
        columns={columns}
        rows={filteredDrawings}
        rowKey="id"
        loading={loading}
        page={page}
        pageSize={20}
        total={filteredDrawings.length}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/m03/drawings/${(row as Drawing).id}`)}
        actions={[
          {
            label: '查看',
            onClick: (row) => navigate(`/m03/drawings/${(row as Drawing).id}`),
          },
          {
            label: '编辑',
            onClick: (row) => {
              const d = row as Drawing;
              if (d.status !== 'designing') {
                onError('只有设计中状态才能编辑');
                return;
              }
              navigate(`/m03/drawings/${d.id}/edit`);
            },
          },
          {
            label: '删除',
            onClick: async (row) => {
              const d = row as Drawing;
              if (d.status !== 'designing') {
                onError('只有设计中状态才能删除');
                return;
              }
              useM03Store.setState({ error: null });
              await removeDrawing(d.id);
              const err = useM03Store.getState().error;
              if (err) { onError(err); } else { onSuccess('图纸删除成功'); }
            },
            color: 'error',
          },
        ]}
      />

      {/* 卡片视图（小屏备用） */}
      {filteredDrawings.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 1, display: { xs: 'flex', md: 'none' } }}>
          {filteredDrawings.map((d) => (
            <Grid item xs={12} sm={6} key={d.id}>
              <Card
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/m03/drawings/${d.id}`)}
              >
                <CardContent>
                  <Typography variant="subtitle2">{d.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{d.code}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" label={categoryLabel[d.category]} />
                    <StatusBadge status={d.status} label={statusLabel[d.status]} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
