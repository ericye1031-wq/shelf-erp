import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Grid, Button, Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM11Store } from '@/stores/useM11Store';
import { formatDate, formatMoney } from '@/utils/format';
import type { InventoryItem, Batch, Warehouse, WarehouseLocation } from '@/types/m11';

const STATUS_LABELS: Record<string, string> = {
  normal: '正常', low: '低库存', overstock: '积压', frozen: '冻结',
};
const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  normal: 'success', low: 'warning', overstock: 'warning', frozen: 'error',
};
const BATCH_COLORS: Record<string, 'info' | 'success' | 'error'> = {
  in_inspection: 'info', qualified: 'success', unqualified: 'error', frozen: 'error',
};
const BATCH_LABELS: Record<string, string> = {
  in_inspection: '检验中', qualified: '合格', unqualified: '不合格', frozen: '冻结',
};

export default function InventoryKanbanPage() {
  const {
    inventory, batches, warehouses, locations,
    loading, error,
    fetchInventory, fetchBatches, fetchWarehouses, fetchLocations,
  } = useM11Store();

  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchBatches();
    fetchWarehouses();
  }, [fetchInventory, fetchBatches, fetchWarehouses]);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchLocations(selectedWarehouse);
    }
  }, [selectedWarehouse, fetchLocations]);

  // KPI calculations
  const totalSkus = inventory.length;
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity || 0) * 100, 0);
  const lowStockCount = inventory.filter((i) => i.status === 'low').length;
  const slowMovingCount = inventory.filter((i) => i.status === 'overstock').length;
  const normalCount = inventory.filter((i) => i.status === 'normal').length;
  const frozenCount = inventory.filter((i) => i.status === 'frozen').length;

  // FIFO batch order
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime()
  );

  // Zone/aisle/row view
  const zoneGroups = locations.reduce((acc, loc) => {
    const key = `${loc.zone} / ${loc.row}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {} as Record<string, WarehouseLocation[]>);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="库存看板"
        subtitle={`总SKU ${totalSkus} | 正常 ${normalCount} | 低库存预警 ${lowStockCount}`}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#E3F2FD' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <InventoryIcon sx={{ fontSize: 32, color: '#1565C0', mb: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0' }}>{totalSkus}</Typography>
              <Typography variant="body2" color="text.secondary">总SKU数</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#E8F5E9' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <AttachMoneyIcon sx={{ fontSize: 32, color: '#2E7D32', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32' }}>{formatMoney(totalValue)}</Typography>
              <Typography variant="body2" color="text.secondary">库存总值（估算）</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <WarningIcon sx={{ fontSize: 32, color: '#E65100', mb: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#E65100' }}>{lowStockCount}</Typography>
              <Typography variant="body2" color="text.secondary">低库存预警</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#FCE4EC' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <LocalShippingIcon sx={{ fontSize: 32, color: '#C62828', mb: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#C62828' }}>{slowMovingCount}</Typography>
              <Typography variant="body2" color="text.secondary">呆滞/积压</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Batch FIFO listing */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            批次清单（FIFO 先进先出顺序）
          </Typography>
          {sortedBatches.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>暂无批次数据</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>批次号</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>物料</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>规格</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">数量</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">剩余</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>生产日期</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>到期日</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>状态</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>库位</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedBatches.map((b, idx) => (
                    <TableRow key={b.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{b.code}</TableCell>
                      <TableCell>{b.material}</TableCell>
                      <TableCell>{b.spec}</TableCell>
                      <TableCell align="right">{b.quantity}</TableCell>
                      <TableCell align="right">{b.remainingQty}</TableCell>
                      <TableCell>{formatDate(b.productionDate)}</TableCell>
                      <TableCell>{b.expiryDate ? formatDate(b.expiryDate) : '-'}</TableCell>
                      <TableCell>
                        <Chip label={BATCH_LABELS[b.status] || b.status} size="small"
                          color={BATCH_COLORS[b.status] || 'default'} />
                      </TableCell>
                      <TableCell>{b.locationCode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Storage Location Visualization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            库位分布（区域 / 排）
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined" size="small"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => setSelectedWarehouse('')}
              color={selectedWarehouse === '' ? 'primary' : 'inherit'}
            >
              全部仓库
            </Button>
            {warehouses.map((w) => (
              <Button
                key={w.id}
                variant="outlined" size="small"
                sx={{ mr: 1, mb: 1 }}
                onClick={() => setSelectedWarehouse(w.id)}
                color={selectedWarehouse === w.id ? 'primary' : 'inherit'}
              >
                {w.name}
              </Button>
            ))}
          </Box>
          {Object.keys(zoneGroups).length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              {selectedWarehouse ? '该仓库暂无库位数据' : '请选择仓库查看库位分布'}
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {Object.entries(zoneGroups).map(([zoneRow, locs]) => (
                <Grid item xs={12} sm={6} md={4} key={zoneRow}>
                  <Card variant="outlined" sx={{ p: 1.5, bgcolor: '#FAFAFA' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {zoneRow}
                      <Chip label={`${locs.length} 个库位`} size="small" sx={{ ml: 1 }} />
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {locs.slice(0, 12).map((loc) => (
                        <Chip
                          key={loc.id}
                          label={loc.code}
                          size="small"
                          variant="outlined"
                          color={loc.type === 'storage' ? 'primary' : loc.type === 'picking' ? 'success' : 'default'}
                        />
                      ))}
                      {locs.length > 12 && (
                        <Chip label={`+${locs.length - 12}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Stock Count Plan Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>盘点计划</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#FFF8E1' }}>
                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="h6" color="warning.main">{totalSkus}</Typography>
                  <Typography variant="caption" color="text.secondary">待盘点SKU</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#E8F5E9' }}>
                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="h6" color="success.main">0</Typography>
                  <Typography variant="caption" color="text.secondary">已完成</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#FFEBEE' }}>
                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="h6" color="error.main">{frozenCount}</Typography>
                  <Typography variant="caption" color="text.secondary">冻结项</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#E3F2FD' }}>
                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography variant="h6" color="info.main">{normalCount}</Typography>
                  <Typography variant="caption" color="text.secondary">正常流转</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
