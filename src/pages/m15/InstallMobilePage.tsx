import { useState, useRef, useCallback } from 'react';
import {
  Box, Alert, Button, Card, CardContent, Typography, TextField, Grid, Chip, Snackbar,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM15Store } from '@/stores/useM15Store';
import { useCrudFeedback } from '@/hooks/useCrudFeedback';

/** 模拟扫码结果 */
const MOCK_SCAN_CODES = [
  'PLAN-2025-001/SITE-A',
  'PLAN-2025-002/SITE-B',
  'PLAN-2025-003/SITE-C',
];

export default function InstallMobilePage() {
  const { plans, fetchPlans, loading, createReport } = useM15Store();
  const { onSuccess, onError } = useCrudFeedback();

  const [scanValue, setScanValue] = useState('');
  const [scannedPlan, setScannedPlan] = useState<{ planId: string; code: string; siteAddress: string } | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [defectQty, setDefectQty] = useState<number>(0);
  const [workContent, setWorkContent] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  /** 处理扫码 */
  const handleScan = useCallback(() => {
    const code = scanValue.trim();
    if (!code) { onError('请先扫描或输入二维码'); return; }

    // 尝试匹配计划
    const matchedPlan = plans.find((p) => p.code && code.includes(p.code));
    if (matchedPlan) {
      setScannedPlan({ planId: matchedPlan.id, code: matchedPlan.code, siteAddress: matchedPlan.siteAddress });
      onSuccess(`已匹配计划: ${matchedPlan.code}`);
    } else {
      // 模拟匹配
      const mock = MOCK_SCAN_CODES.find((m) => code.includes(m));
      if (mock) {
        const parts = mock.split('/');
        setScannedPlan({ planId: mock, code: parts[0], siteAddress: parts[1] });
        onSuccess(`已匹配（模拟）: ${parts[0]}`);
      } else {
        onError('未找到匹配的安装计划，请检查二维码');
      }
    }
  }, [scanValue, plans, onSuccess, onError]);

  /** 提交报工 */
  const handleSubmit = async () => {
    if (!scannedPlan) { onError('请先扫码选择计划'); return; }
    if (!workerName) { onError('请填写工人姓名'); return; }
    if (!startTime) { onError('请填写开始时间'); return; }

    try {
      await createReport({
        planId: scannedPlan.planId,
        workerName,
        workDate: new Date().toISOString().slice(0, 10),
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        overtimeHours: 0,
        workContent: workContent || undefined,
        completionPercent: 0,
      });
      setSubmitted(true);
      onSuccess('PDA报工提交成功');

      // 重置表单
      setTimeout(() => {
        setScanValue('');
        setScannedPlan(null);
        setStartTime('');
        setEndTime('');
        setQuantity(0);
        setDefectQty(0);
        setWorkContent('');
        setWorkerName('');
        setSubmitted(false);
      }, 2000);
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  };

  /** 快速设置当前时间 */
  const setCurrentTime = (field: 'start' | 'end') => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (field === 'start') setStartTime(time);
    else setEndTime(time);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', position: 'relative' }}>
      <LoadingOverlay loading={loading} />

      <PageHeader
        title="PDA 报工"
        subtitle="扫码上报安装工作进度"
      />

      {/* 扫码区域 */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeScannerIcon color="primary" />
            扫码识别
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              inputRef={scanInputRef}
              label="扫描二维码 / 输入计划编号"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              size="small"
              fullWidth
              placeholder="对准二维码扫描..."
              onKeyDown={(e) => { if (e.key === 'Enter') handleScan(); }}
            />
            <Button variant="contained" onClick={handleScan} sx={{ backgroundColor: '#005591', minWidth: 80 }}>
              识别
            </Button>
          </Box>
          {scannedPlan && (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
              <Typography variant="body2" color="success.dark">
                <strong>已匹配：</strong>{scannedPlan.code} — {scannedPlan.siteAddress}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 报工表单 */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon color="primary" />
            工时信息
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="工人姓名"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                size="small"
                fullWidth
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="开始时间"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <Button size="small" onClick={() => setCurrentTime('start')} sx={{ minWidth: 48, fontSize: 11 }}>
                      现在
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="结束时间"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <Button size="small" onClick={() => setCurrentTime('end')} sx={{ minWidth: 48, fontSize: 11 }}>
                      现在
                    </Button>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 数量信息 */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="primary" />
            数量信息
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label="完成数量"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label="不良数量"
                type="number"
                value={defectQty}
                onChange={(e) => setDefectQty(Number(e.target.value) || 0)}
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
                helperText={defectQty > 0 ? '建议拍照记录' : undefined}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="工作内容"
                value={workContent}
                onChange={(e) => setWorkContent(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
                placeholder="简要说说明本次工作内容..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleSubmit}
        disabled={submitted || !scannedPlan}
        sx={{ backgroundColor: '#005591', py: 1.5, fontSize: 16 }}
        startIcon={<CameraAltIcon />}
      >
        {submitted ? '已提交 ✓' : '提交报工'}
      </Button>

      {/* 成功 Snackbar */}
      <Snackbar
        open={submitted}
        autoHideDuration={3000}
        onClose={() => setSubmitted(false)}
        message="报工提交成功！"
      />
    </Box>
  );
}
