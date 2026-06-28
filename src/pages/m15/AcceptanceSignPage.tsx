import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Alert, Button, Card, CardContent, Typography, TextField,
  Grid, Chip, Divider, Snackbar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';
import { formatDate } from '@/utils/format';
import type { InstallAcceptance } from '@/types/m15';

const RESULT_LABELS: Record<string, string> = {
  passed: '验收通过',
  with_issues: '带问题通过',
  failed: '验收不通过',
};

const RESULT_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  passed: 'success',
  with_issues: 'warning',
  failed: 'error',
};

export default function AcceptanceSignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    plans, fetchPlans, currentPlan, fetchPlanById,
    acceptances, fetchAcceptances,
    loading, error,
  } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // Fetch plan by id
  useEffect(() => {
    if (id) fetchPlanById(id);
    fetchPlans();
  }, [id, fetchPlanById, fetchPlans]);

  const plan = currentPlan;
  const acceptance = acceptances.find((a) => a.planId === id);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.strokeStyle = '#1a237e';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getCanvasPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getCanvasPos(e);
      setLastPos(pos);
    },
    [getCanvasPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing || !lastPos) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const pos = getCanvasPos(e);

      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      setLastPos(pos);
      setHasSignature(true);
    },
    [isDrawing, lastPos, getCanvasPos],
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!hasSignature) {
      setSnack({ open: true, message: '请先签名后再提交', severity: 'error' });
      return;
    }
    if (!signerName.trim()) {
      setSnack({ open: true, message: '请输入签字人姓名', severity: 'error' });
      return;
    }
    setSubmitted(true);
    onSuccess('验收签字提交成功！');
    setTimeout(() => navigate('/m15/acceptances'), 2000);
  }, [hasSignature, signerName, onSuccess, navigate]);

  if (!id) {
    return <Alert severity="error">缺少验收记录ID</Alert>;
  }

  return (
    <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
      <LoadingOverlay loading={loading} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PageHeader
        title="验收签字"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/m15/acceptances')}
          >
            返回
          </Button>
        }
      />

      {/* 验收详情 */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            验收详情
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                计划编号
              </Typography>
              <Typography variant="body1">
                {plan?.code || id}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                项目地址
              </Typography>
              <Typography variant="body1">
                {plan?.siteAddress || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                验收日期
              </Typography>
              <Typography variant="body1">
                {acceptance?.acceptDate
                  ? formatDate(acceptance.acceptDate)
                  : new Date().toLocaleDateString('zh-CN')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                验收结果
              </Typography>
              <Chip
                label={
                  acceptance
                    ? RESULT_LABELS[acceptance.result]
                    : '待验收'
                }
                size="small"
                color={
                  acceptance
                    ? RESULT_COLORS[acceptance.result]
                    : 'default'
                }
              />
            </Grid>
            {acceptance?.issueDesc && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  整改问题
                </Typography>
                <Typography variant="body1" color="warning.main">
                  {acceptance.issueDesc}
                </Typography>
              </Grid>
            )}
            {acceptance?.warrantyStartDate && acceptance?.warrantyEndDate && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  质保期
                </Typography>
                <Typography variant="body1">
                  {formatDate(acceptance.warrantyStartDate)} ~{' '}
                  {formatDate(acceptance.warrantyEndDate)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* 签字区 */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            客户签字
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            请在下方白色区域内使用鼠标或触摸屏签名
          </Typography>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'grey.400',
              borderRadius: 1,
              overflow: 'hidden',
              mb: 1,
              position: 'relative',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 180,
                cursor: 'crosshair',
                display: 'block',
                backgroundColor: '#fafafa',
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              清除重签
            </Button>
            {hasSignature && (
              <Chip
                icon={<CheckCircleIcon />}
                label="已签名"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <TextField
            label="签字人姓名"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            size="small"
            fullWidth
            required
            placeholder="请输入客户签字人姓名"
            sx={{ mb: 2 }}
          />
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/m15/acceptances')}
          disabled={submitted}
        >
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitted}
          sx={{
            backgroundColor: submitted ? 'grey.400' : '#005591',
            minWidth: 160,
          }}
        >
          {submitted ? '已提交' : '确认签字并提交'}
        </Button>
      </Box>

      {submitted && (
        <Alert severity="success" sx={{ mt: 2 }}>
          验收签字已成功提交，即将跳转...
        </Alert>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        message={snack.message}
      />
    </Box>
  );
}
