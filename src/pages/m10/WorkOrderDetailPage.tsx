import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Grid, Typography, LinearProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import StatusBadge from '@/components/common/StatusBadge';
import { useM10Store } from '@/stores/useM10Store';
import type { ProcessStep } from '@/types/m10';
import { formatDate } from '@/utils/format';

const STEP_STATUS: Record<string, string> = { pending: '待执行', in_progress: '执行中', completed: '已完成', skipped: '已跳过' };

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkOrder, processSteps, loading, fetchWorkOrderById, fetchProcessSteps } = useM10Store();

  useEffect(() => { if (id) { fetchWorkOrderById(id); fetchProcessSteps(id); } }, [id, fetchWorkOrderById, fetchProcessSteps]);

  const progress = currentWorkOrder ? (processSteps.filter((s) => s.status === 'completed').length / Math.max(1, processSteps.length)) * 100 : 0;

  const stepColumns: Column<ProcessStep>[] = [
    { id: 'sequence', label: '序号', width: 50, align: 'center' },
    { id: 'stepCode', label: '工序编码', width: 100 },
    { id: 'stepName', label: '工序名称' },
    { id: 'equipmentName', label: '设备', width: 100 },
    { id: 'plannedMinutes', label: '计划工时(分)', width: 100, align: 'right' },
    { id: 'status', label: '状态', width: 80, render: (r) => <StatusBadge status={r.status} label={STEP_STATUS[r.status] || r.status} /> },
    { id: 'operatorName', label: '操作员', width: 80 },
  ];

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="工单详情" subtitle={currentWorkOrder?.code} action={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/m10/work-orders')}>返回</Button>} />
      {currentWorkOrder && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">计划数 / 完成数</Typography><Typography variant="h6">{currentWorkOrder.completedQty} / {currentWorkOrder.quantity}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">状态</Typography><StatusBadge status={currentWorkOrder.status} label={currentWorkOrder.status} /></Grid>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">计划开始</Typography><Typography>{(currentWorkOrder.plannedStart) ? formatDate(currentWorkOrder.plannedStart) : "-"}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="body2" color="text.secondary">计划结束</Typography><Typography>{(currentWorkOrder.plannedEnd) ? formatDate(currentWorkOrder.plannedEnd) : "-"}</Typography></Grid>
              </Grid>
              <Box sx={{ mt: 2 }}><Typography variant="body2" color="text.secondary">工序进度</Typography><LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5, height: 8, borderRadius: 4 }} /></Box>
            </CardContent>
          </Card>
          <DataTable columns={stepColumns} rows={processSteps} rowKey="id" loading={loading} page={0} pageSize={50} total={processSteps.length} />
        </>
      )}
    </Box>
  );
}
