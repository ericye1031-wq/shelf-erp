import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, Typography, Chip, Divider, TextField, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM05Store } from '@/stores/useM05Store';
import type { QuotationVersion } from '@/types/m05';

export default function VersionComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quotationId = searchParams.get('quotationId') || '';
  const { currentQuotation, versions, loading, fetchQuotationById, fetchVersions, compareVersions } = useM05Store();
  const [v1, setV1] = useState<number>(1);
  const [v2, setV2] = useState<number>(2);

  useEffect(() => {
    if (quotationId) {
      fetchQuotationById(quotationId);
      fetchVersions(quotationId);
    }
  }, [quotationId, fetchQuotationById, fetchVersions]);

  useEffect(() => {
    if (v1 && v2 && quotationId) compareVersions(quotationId, v1, v2);
  }, [v1, v2, quotationId, compareVersions]);

  const versionA = versions.find((v) => v.version === v1);
  const versionB = versions.find((v) => v.version === v2);
  const priceDiff = versionA && versionB ? versionB.totalPrice - versionA.totalPrice : 0;

  const renderVersionDetail = (ver: QuotationVersion | undefined, label: string) => {
    if (!ver) return <Typography color="text.secondary">请选择版本</Typography>;
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>{label} (v{ver.version})</Typography>
        <Typography variant="body2">单价: ¥{ver.unitPrice.toFixed(2)}</Typography>
        <Typography variant="body2">总价: ¥{ver.totalPrice.toFixed(2)}</Typography>
        <Typography variant="body2">毛利率: {(ver.margin * 100).toFixed(1)}%</Typography>
        {ver.changedFields.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">变更字段:</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              {ver.changedFields.map((f) => <Chip key={f} label={f} size="small" />)}
            </Box>
          </Box>
        )}
        {ver.remark && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>备注: {ver.remark}</Typography>}
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader
        title="版本对比"
        subtitle={currentQuotation ? `报价: ${currentQuotation.code} | 客户: ${currentQuotation.customerName}` : ''}
        action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m05/quotations')}>返回列表</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <TextField select fullWidth size="small" label="版本A" value={v1} onChange={(e) => setV1(Number(e.target.value))}>
            {versions.map((v) => <MenuItem key={v.version} value={v.version}>v{v.version}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField select fullWidth size="small" label="版本B" value={v2} onChange={(e) => setV2(Number(e.target.value))}>
            {versions.filter((v) => v.version !== v1).map((v) => <MenuItem key={v.version} value={v.version}>v{v.version}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {versionA && versionB && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">价格差异:</Typography>
                <Typography variant="h5" color={priceDiff > 0 ? 'error' : 'success'}>
                  {priceDiff > 0 ? '+' : ''}¥{priceDiff.toFixed(2)}
                </Typography>
                {priceDiff !== 0 && (priceDiff > 0 ? <TrendingUpIcon color="error" /> : <TrendingDownIcon color="success" />)}
              </Box>
            </CardContent>
          </Card>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>{renderVersionDetail(versionA, '版本A')}</CardContent></Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>{renderVersionDetail(versionB, '版本B')}</CardContent></Card>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>版本信息对比</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>{renderVersionDetail(versionA, '版本A')}</CardContent></Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined"><CardContent>{renderVersionDetail(versionB, '版本B')}</CardContent></Card>
            </Grid>
          </Grid>
        </>
      )}
      {!versionA && !versionB && !loading && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>请选择两个版本进行对比</Typography>
      )}
    </Box>
  );
}
