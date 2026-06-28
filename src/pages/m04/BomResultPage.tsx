import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, Typography, Chip, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM04Store } from '@/stores/useM04Store';
import type { BomCalcItem } from '@/types/m04';

const CATEGORY_LABELS: Record<string, string> = {
  upright: '立柱', beam: '横梁', shelf_board: '层板', brace: '加强筋',
  fastener: '紧固件', back_panel: '背板', other: '其他',
};

const bomColumns: Column<BomCalcItem>[] = [
  { id: 'partCode', label: '物料编码', sortable: true, width: 110 },
  { id: 'partName', label: '名称', width: 140 },
  { id: 'material', label: '材质', width: 80 },
  { id: 'category', label: '分类', width: 80, render: (r) => CATEGORY_LABELS[r.category] || r.category },
  { id: 'quantity', label: '数量', width: 70, align: 'right' },
  { id: 'length', label: '长度(mm)', width: 90, align: 'right', render: (r) => r.length ? r.length.toFixed(1) : '-' },
  { id: 'unit', label: '单位', width: 50 },
  { id: 'unitWeight', label: '单位重量(kg)', width: 100, align: 'right', render: (r) => r.unitWeight?.toFixed(3) || '-' },
  { id: 'unitCost', label: '单价(¥/kg)', width: 90, align: 'right', render: (r) => r.unitCost?.toFixed(2) || '-' },
  { id: 'totalCost', label: '总价(¥)', width: 100, align: 'right', render: (r) => r.totalCost?.toFixed(2) || '-' },
  { id: 'wasteRate', label: '损耗率', width: 80, align: 'right', render: (r) => `${((r.wasteRate || 0) * 100).toFixed(1)}%` },
];

export default function BomResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const configId = searchParams.get('configId') || '';
  const { calcResult, loading, error, calculateBom } = useM04Store();

  useEffect(() => {
    if (configId) calculateBom(configId);
  }, [configId, calculateBom]);

  // 展平BOM项（包括子节点）
  const flatItems = useMemo(() => {
    if (!calcResult?.items) return [];
    const result: BomCalcItem[] = [];
    const flatten = (items: BomCalcItem[], depth: number = 0) => {
      for (const item of items) {
        result.push({ ...item, _depth: depth } as BomCalcItem & { _depth: number });
        if (item.children?.length) flatten(item.children, depth + 1);
      }
    };
    flatten(calcResult.items);
    return result;
  }, [calcResult]);

  const stats = useMemo(() => {
    if (!calcResult) return { totalParts: 0, totalMaterialCost: 0 };
    return {
      totalParts: calcResult.totalItems || flatItems.length,
      totalMaterialCost: calcResult.totalMaterialCost || 0,
    };
  }, [calcResult, flatItems]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader
        title="BOM计算结果"
        subtitle={calcResult ? `${calcResult.configName} | 规格: ${calcResult.specificationName || '未匹配'}` : ''}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<RefreshIcon />} onClick={() => configId && calculateBom(configId)} disabled={loading}>重新计算</Button>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>返回</Button>
          </Box>
        }
      />

      {calcResult && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary">配置</Typography>
                  <Typography variant="h6" color="primary">{calcResult.configName}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary">物料总数</Typography>
                  <Typography variant="h6">{stats.totalParts}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary">材料成本合计</Typography>
                  <Typography variant="h6" color="error">¥{stats.totalMaterialCost.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="text.secondary">匹配规格</Typography>
                  <Typography variant="h6">{calcResult.specificationName || '未匹配'}</Typography>
                </Grid>
                <Grid item xs={8} sm={3}>
                  <Typography variant="body2" color="text.secondary">配置参数</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {Object.entries(calcResult.parameters).map(([k, v]) => (
                      <Chip key={k} label={`${k}: ${v}`} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <DataTable
            columns={bomColumns}
            rows={flatItems}
            rowKey="partCode"
            loading={loading}
            page={0}
            pageSize={50}
            total={flatItems.length}
            defaultSort={{ field: 'partCode', direction: 'asc' }}
          />
        </>
      )}
      {!calcResult && !loading && !error && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>请从配置页面选择配置后计算BOM</Typography>
      )}
    </Box>
  );
}
