import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Alert, Button, Typography, Paper, Grid, Timeline, TimelineItem,
  TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, Chip,
} from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM03Store } from '@/stores/useM03Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import type { Scheme, SchemeVersion } from '@/types/m03';

const statusLabel: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  approved: '已批准',
  rejected: '已驳回',
};

const versionStatusLabel: Record<string, string> = {
  draft: '草稿',
  approved: '已批准',
};

export default function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentScheme, versions, loading, error, fetchSchemeById, fetchVersions, changeSchemeStatus } = useM03Store();
  const { onSuccess, onError } = useCrudFeedback();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSchemeById(id);
      fetchVersions(id);
    }
  }, [id, fetchSchemeById, fetchVersions]);

  const scheme: Scheme | null = currentScheme;

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    try {
      await changeSchemeStatus(id!, status);
      const err = useM03Store.getState().error;
      if (err) { onError(err); } else { onSuccess('状态更新成功'); }
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading || actionLoading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PageHeader
        title={scheme ? `方案详情 - ${scheme.name}` : '方案详情'}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {scheme && scheme.status === 'draft' && (
              <Button
                variant="outlined"
                onClick={() => handleStatusChange('submitted')}
              >
                提交审核
              </Button>
            )}
            {scheme && scheme.status === 'submitted' && (
              <>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => handleStatusChange('approved')}
                >
                  批准
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleStatusChange('rejected')}
                >
                  驳回
                </Button>
              </>
            )}
            <Button variant="outlined" onClick={() => navigate('/m03/schemes')}>
              返回列表
            </Button>
          </Box>
        }
      />

      {scheme && (
        <Grid container spacing={3}>
          {/* 基本信息 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>基本信息</Typography>
              <Typography>方案编号：{scheme.code}</Typography>
              <Typography>方案名称：{scheme.name}</Typography>
              <Typography>货架类型：{scheme.rackType || '-'}</Typography>
              <Typography>当前版本：{scheme.currentVersion}</Typography>
              <Box sx={{ mt: 1 }}>
                <StatusBadge status={scheme.status} label={statusLabel[scheme.status] || scheme.status} />
              </Box>
              <Typography sx={{ mt: 2 }}>描述：{scheme.description || '-'}</Typography>
            </Paper>
          </Grid>

          {/* 版本历史 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>版本历史</Typography>
              {versions.length === 0 ? (
                <Typography color="text.secondary">暂无版本记录</Typography>
              ) : (
                <Timeline>
                  {versions.map((v: SchemeVersion) => (
                    <TimelineItem key={v.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          color={v.status === 'approved' ? 'success' : 'grey'}
                        />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">
                          {v.versionNo}
                          <Chip
                            size="small"
                            label={versionStatusLabel[v.status] || v.status}
                            color={v.status === 'approved' ? 'success' : 'default'}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {v.changeSummary}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(v.createdAt).toLocaleString()}
                          {v.approvedBy && ` · 审批人：${v.approvedBy}`}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
