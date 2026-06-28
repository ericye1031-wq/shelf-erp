import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, Chip, Stack, Divider, Alert, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM04Store } from '@/stores/useM04Store';
import type { Specification } from '@/types/m04';

export default function SpecMatchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const configId = searchParams.get('configId') || '';
  const { specMatchResult, specifications, currentConfig, loading, error, matchSpecification, fetchConfigById, fetchSpecifications } = useM04Store();

  useEffect(() => {
    if (configId) {
      fetchConfigById(configId);
      matchSpecification(configId);
    }
  }, [configId, fetchConfigById, matchSpecification]);

  // 加载后获取当前配置关联的货架类型下的所有规格
  useEffect(() => {
    if (currentConfig?.shelfTypeId) {
      fetchSpecifications(currentConfig.shelfTypeId);
    }
  }, [currentConfig?.shelfTypeId, fetchSpecifications]);

  const matchedSpec: Specification | null = specMatchResult?.specification || null;

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <PageHeader title="规格匹配" action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>返回</Button>} />

      {currentConfig && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{currentConfig.name}</Typography>
            <Typography variant="body2" color="text.secondary">类型: {currentConfig.shelfTypeName}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              {Object.entries(currentConfig.parameters).map(([k, v]) => (
                <Chip key={k} label={`${k}: ${v}`} size="small" variant="outlined" />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* 匹配结果 */}
      {specMatchResult && (
        <Card sx={{ mb: 2, borderLeft: 4, borderColor: specMatchResult.matched ? 'success.main' : 'error.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {specMatchResult.matched ? (
                <CheckCircleIcon color="success" fontSize="large" />
              ) : (
                <CancelIcon color="error" fontSize="large" />
              )}
              <Box>
                <Typography variant="h6">{specMatchResult.matched ? '匹配成功' : '未找到匹配规格'}</Typography>
                {matchedSpec && (
                  <Typography variant="body2" color="text.secondary">
                    匹配规格: {matchedSpec.name} (ID: {matchedSpec.id.substring(0, 8)}...)
                  </Typography>
                )}
              </Box>
            </Box>

            {/* 匹配到的规格详情 */}
            {matchedSpec && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>规格约束参数</Typography>
                <Grid container spacing={1}>
                  {Object.entries(matchedSpec.parameterConstraints).map(([key, constraint]) => (
                    <Grid item xs={6} sm={4} key={key}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="caption" color="text.secondary">{key}</Typography>
                        <Typography variant="body2">
                          {constraint.min && constraint.max ? `${constraint.min} ~ ${constraint.max}` :
                           constraint.values ? constraint.values.join(' / ') : '无限制'}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {matchedSpec.structureTemplate?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">结构模板节点数: {matchedSpec.structureTemplate.length}</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      {matchedSpec.structureTemplate.map((node) => (
                        <Chip key={node.partCode} label={`${node.partCode} - ${node.partName}`} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            )}

            {!specMatchResult.matched && specMatchResult.unmatchedParams.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">配置参数无对应规格约束:</Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                  {specMatchResult.unmatchedParams.map((p) => (
                    <Chip key={p} label={p} size="small" color="warning" />
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 所有可用规格列表 */}
      {specifications.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            可用规格列表 ({specifications.length})
          </Typography>
          {specifications.map((spec) => (
            <Card
              key={spec.id}
              sx={{ mb: 1, borderLeft: 3, borderColor: spec.id === matchedSpec?.id ? 'success.main' : 'grey.300' }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">
                    {spec.name}
                    {spec.id === matchedSpec?.id && <Chip label="已匹配" size="small" color="success" sx={{ ml: 1 }} />}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    约束: {Object.keys(spec.parameterConstraints).join(', ')} | 结构: {spec.structureTemplate?.length || 0}节点
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
}
