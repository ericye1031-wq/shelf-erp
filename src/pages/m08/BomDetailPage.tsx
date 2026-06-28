import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM08Store } from '@/stores/useM08Store';
import type { BomItem } from '@/types/m08';

const columns: Column<BomItem>[] = [
  { id: 'partCode', label: '物料编码', width: 110 },
  { id: 'partName', label: '名称', width: 140 },
  { id: 'material', label: '材质', width: 80 },
  { id: 'spec', label: '规格', width: 120 },
  { id: 'level', label: '层级', width: 50, align: 'center' },
  { id: 'quantity', label: '数量', width: 70, align: 'right' },
  { id: 'unit', label: '单位', width: 50 },
  { id: 'length', label: '长度(mm)', width: 90, align: 'right' },
  { id: 'weight', label: '重量(kg)', width: 90, align: 'right', render: (r) => r.weight.toFixed(2) },
  { id: 'unitCost', label: '单价(¥)', width: 90, align: 'right', render: (r) => r.unitCost.toFixed(2) },
  { id: 'totalCost', label: '总价(¥)', width: 100, align: 'right', render: (r) => r.totalCost.toFixed(2) },
  { id: 'wasteRate', label: '损耗率', width: 80, align: 'right', render: (r) => `${(r.wasteRate * 100).toFixed(1)}%` },
];

export default function BomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBom, loading, fetchBomById } = useM08Store();

  useEffect(() => { if (id) fetchBomById(id); }, [id, fetchBomById]);

  const stats = useMemo(() => {
    if (!currentBom) return { items: 0, totalWt: 0, totalCost: 0, maxLevel: 0 };
    return {
      items: currentBom.items.length,
      totalWt: currentBom.items.reduce((s, i) => s + i.weight, 0),
      totalCost: currentBom.items.reduce((s, i) => s + i.totalCost, 0),
      maxLevel: Math.max(...currentBom.items.map((i) => i.level)),
    };
  }, [currentBom]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="BOM详情" subtitle={`${currentBom?.id || ''} v${currentBom?.version || ''}`} action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m08/bom-list')}>返回</Button>} />
      {currentBom && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">物料项数</Typography><Typography variant="h6">{stats.items}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">总重量</Typography><Typography variant="h6">{stats.totalWt.toFixed(1)} kg</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">总成本</Typography><Typography variant="h6">¥{stats.totalCost.toFixed(2)}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">最大层级</Typography><Typography variant="h6">{stats.maxLevel}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
          <DataTable columns={columns} rows={currentBom.items} rowKey="id" loading={loading} page={0} pageSize={100} total={currentBom.items.length} />
        </>
      )}
    </Box>
  );
}
