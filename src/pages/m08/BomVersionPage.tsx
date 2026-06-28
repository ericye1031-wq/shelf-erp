import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM08Store } from '@/stores/useM08Store';
import { formatDate } from '@/utils/format';

export default function BomVersionPage() {
  const navigate = useNavigate();
  const { versions, boms, loading, fetchVersions, fetchBoms } = useM08Store();
  const bomId = (() => { try { return new URLSearchParams(window.location.search).get('bomId') || ''; } catch { return ''; } })();

  useEffect(() => { fetchBoms(); if (bomId) fetchVersions(bomId); }, [bomId, fetchBoms, fetchVersions]);

  const bom = boms.find((b) => b.id === bomId);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="BOM版本管理" subtitle={bom ? `BOM: ${bom.id}` : ''} action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m08/bom-list')}>返回</Button>} />
      {!versions.length && !loading ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无版本记录</Typography>
      ) : (
        versions.map((v) => (
          <Card key={v.id} sx={{ mb: 1 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2">版本 v{v.version}</Typography>
                <Typography variant="body2" color="text.secondary">{v.changeNote || '无变更说明'}</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(v.createdAt)} · {v.createdBy}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {v.changedItemIds.map((id) => <Chip key={id} label={id} size="small" />)}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
