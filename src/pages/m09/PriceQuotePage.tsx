import { useEffect, useState, useMemo } from 'react';
import {
  Box, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  Card, CardContent, Grid, Button,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SearchBar from '@/components/common/SearchBar';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM09Store } from '@/stores/useM09Store';
import type { SupplierPrice, SupplierQuote } from '@/types/m09';
import { formatDate, formatMoney } from '@/utils/format';

/** 按物料分组报价比较 */
interface QuoteGroup {
  materialCode: string;
  materialName: string;
  quotes: SupplierQuote[];
  minPrice: number;
  maxPrice: number;
}

export default function PriceQuotePage() {
  const { supplierQuotes, supplierPrices, loading, fetchSupplierQuotes, fetchSupplierPrices } = useM09Store();
  const [searchMaterial, setSearchMaterial] = useState('');
  const [view, setView] = useState<'prices' | 'quotes'>('prices');

  useEffect(() => {
    fetchSupplierPrices();
    fetchSupplierQuotes();
  }, [fetchSupplierPrices, fetchSupplierQuotes]);

  const filteredPrices = useMemo(() => {
    return supplierPrices.filter((p) =>
      !searchMaterial ||
      p.materialCode.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      p.materialName.toLowerCase().includes(searchMaterial.toLowerCase())
    );
  }, [supplierPrices, searchMaterial]);

  /** 按 requisitionId 分组报价 */
  const quoteGroups = useMemo(() => {
    const map = new Map<string, SupplierQuote[]>();
    supplierQuotes.forEach((q) => {
      const key = q.requisitionId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    });
    const groups: QuoteGroup[] = [];
    map.forEach((quotes, reqId) => {
      if (quotes.length >= 3) {
        const prices = quotes.map((q) => q.unitPrice).filter((p) => p > 0);
        groups.push({
          materialCode: quotes[0]?.materialCode || reqId,
          materialName: quotes[0]?.materialName || '',
          quotes,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        });
      }
    });
    return groups;
  }, [supplierQuotes]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="价格行情"
        subtitle={view === 'prices' ? '供应商价格单管理' : '报价比价分析'}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant={view === 'prices' ? 'contained' : 'outlined'}
              onClick={() => setView('prices')}
              sx={view === 'prices' ? { backgroundColor: '#005591' } : {}}>
              价格单
            </Button>
            <Button variant={view === 'quotes' ? 'contained' : 'outlined'}
              onClick={() => setView('quotes')}
              sx={view === 'quotes' ? { backgroundColor: '#005591' } : {}}>
              报价比价
            </Button>
          </Box>
        }
      />

      {view === 'prices' ? (
        <>
          <SearchBar placeholder="搜索物料编码/名称" value={searchMaterial} onChange={setSearchMaterial} />

          {filteredPrices.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无价格数据</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>物料编码</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>物料名称</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>供应商</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">单价</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>单位</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>币种</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>生效日期</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#005591' }}>状态</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrices.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{p.materialCode}</Typography>
                      </TableCell>
                      <TableCell>{p.materialName}</TableCell>
                      <TableCell>{p.supplierName}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {formatMoney(p.unitPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>{p.currency || 'CNY'}</TableCell>
                      <TableCell>{formatDate(p.validFrom)}</TableCell>
                      <TableCell>
                        <Chip label={p.isActive ? '有效' : '失效'} size="small"
                          color={p.isActive ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        <>
          {quoteGroups.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              暂无报价比价数据（需≥3家报价的物料）
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {quoteGroups.map((group) => (
                <Grid item xs={12} key={group.materialCode}>
                  <Card variant="outlined">
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {group.materialName}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({group.materialCode})
                          </Typography>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="body2" color="error">
                            最高: {formatMoney(group.maxPrice)}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            最低: {formatMoney(group.minPrice)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            价差: {formatMoney(group.maxPrice - group.minPrice)}
                          </Typography>
                        </Box>
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>供应商</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">单价</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>币种</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">交期(天)</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>有效期</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>状态</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.quotes
                              .sort((a, b) => a.unitPrice - b.unitPrice)
                              .map((q, idx) => (
                                <TableRow key={q.id}
                                  sx={{
                                    backgroundColor: idx === 0 ? '#E8F5E9' : undefined,
                                  }}
                                >
                                  <TableCell>
                                    {q.supplierName}
                                    {idx === 0 && (
                                      <Chip label="最低" size="small" color="success" sx={{ ml: 1 }} />
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight={600}>
                                      {formatMoney(q.unitPrice)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{q.currency || 'CNY'}</TableCell>
                                  <TableCell align="right">{q.leadTime}</TableCell>
                                  <TableCell>
                                    {formatDate(q.validFrom)} ~ {formatDate(q.validTo)}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={q.status} size="small" variant="outlined" />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
