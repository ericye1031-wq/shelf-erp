import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PageHeader from '@/components/common/PageHeader';

interface KpiCard {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  color: string;
}

interface ARItem {
  rank: number;
  customerName: string;
  amount: number;
  pct: number;
}

interface ProjectProgress {
  name: string;
  progress: number;
  status: string;
}

interface ProfitPoint {
  month: string;
  value: number;
}

function TrendChip({ trend, value: tv }: { trend: 'up' | 'down' | 'flat'; value: string }) {
  return (
    <Chip
      icon={trend === 'up' ? <TrendingUpIcon /> : trend === 'down' ? <TrendingDownIcon /> : undefined}
      label={tv}
      size="small"
      color={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
      variant="outlined"
    />
  );
}

function MiniLineChart({ data }: { data: ProfitPoint[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;
  const h = 120;
  const w = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.value - minVal) / range) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Box sx={{ position: 'relative', height: h + 30 }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, overflow: 'visible' }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#005591" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#005591" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#profitGrad)" />
        <polyline points={points} fill="none" stroke="#005591" strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {data.filter((_, i) => i % 2 === 0).map((d) => (
          <Typography key={d.month} variant="caption" sx={{ fontSize: 9 }}>{d.month}</Typography>
        ))}
      </Box>
    </Box>
  );
}

export default function CEODashboardPage() {
  const kpis: KpiCard[] = useMemo(() => [
    { title: '今日产值(万元)', value: '486.2', trend: 'up', trendValue: '+5.3%', color: '#005591' },
    { title: '本月签约(万元)', value: '8,420', trend: 'up', trendValue: '+12.8%', color: '#2E7D32' },
    { title: '本月回款(万元)', value: '6,380', trend: 'down', trendValue: '-3.2%', color: '#1565C0' },
    { title: '本月利润(万元)', value: '1,564', trend: 'up', trendValue: '+8.1%', color: '#E65100' },
    { title: '现金余额(万元)', value: '3,280', trend: 'flat', trendValue: '持平', color: '#6A1B9A' },
    { title: '产能负载率', value: '87.5%', trend: 'up', trendValue: '+2.3%', color: '#00838F' },
    { title: '客户满意度', value: '4.6/5', trend: 'up', trendValue: '+0.2', color: '#C62828' },
    { title: '项目交付率', value: '94.8%', trend: 'up', trendValue: '+1.5%', color: '#37474F' },
  ], []);

  const top10AR: ARItem[] = useMemo(() => [
    { rank: 1, customerName: '华为技术有限公司', amount: 12800000, pct: 18.2 },
    { rank: 2, customerName: '比亚迪股份有限公司', amount: 9850000, pct: 14.0 },
    { rank: 3, customerName: '京东物流集团', amount: 7420000, pct: 10.6 },
    { rank: 4, customerName: '中国建筑集团', amount: 6580000, pct: 9.4 },
    { rank: 5, customerName: '顺丰速运有限公司', amount: 5210000, pct: 7.4 },
    { rank: 6, customerName: '格力电器股份', amount: 4890000, pct: 7.0 },
    { rank: 7, customerName: '美的集团股份', amount: 4120000, pct: 5.9 },
    { rank: 8, customerName: '海尔智家股份', amount: 3680000, pct: 5.2 },
    { rank: 9, customerName: '三一重工股份', amount: 2950000, pct: 4.2 },
    { rank: 10, customerName: '中联重科股份', amount: 2680000, pct: 3.8 },
  ], []);

  const projects: ProjectProgress[] = useMemo(() => [
    { name: '华东智能仓储项目', progress: 78, status: 'on_track' },
    { name: '华南冷链物流中心', progress: 45, status: 'at_risk' },
    { name: '北京大兴机场货架', progress: 92, status: 'on_track' },
    { name: '成都智慧工厂一期', progress: 60, status: 'on_track' },
    { name: '深圳跨境电商仓', progress: 32, status: 'delayed' },
  ], []);

  const profitTrend: ProfitPoint[] = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return months.map((month, i) => ({
      month,
      value: 800 + Math.sin(i * 0.6) * 300 + i * 60 + (Math.random() - 0.5) * 100,
    }));
  }, []);

  return (
    <>
      <PageHeader title="CEO驾驶舱" subtitle="核心经营指标一览" />

      {/* 8 KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 6, sm: 3 }} key={kpi.title}>
            <Card variant="outlined" sx={{ borderLeft: 4, borderColor: kpi.color }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary" noWrap>{kpi.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                  <Typography variant="h6" fontWeight={700} color={kpi.color}>{kpi.value}</Typography>
                  <TrendChip trend={kpi.trend} value={kpi.trendValue} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Top10 AR Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>应收账款 TOP10</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>客户名称</TableCell>
                      <TableCell align="right">金额(万元)</TableCell>
                      <TableCell align="right">占比</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {top10AR.map((ar) => (
                      <TableRow key={ar.rank}>
                        <TableCell>{ar.rank}</TableCell>
                        <TableCell>{ar.customerName}</TableCell>
                        <TableCell align="right">{(ar.amount / 10000).toFixed(0)}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${ar.pct}%`} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Project Progress */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>项目进度</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {projects.map((proj) => {
                  const statusColor = proj.status === 'delayed' ? '#C62828' : proj.status === 'at_risk' ? '#E65100' : '#2E7D32';
                  return (
                    <Box key={proj.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{proj.name}</Typography>
                        <Typography variant="body2" fontWeight={600} color={statusColor}>
                          {proj.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={proj.progress}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': { bgcolor: statusColor, borderRadius: 3 } }} />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profit Trend Line Chart */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>利润趋势 (万元)</Typography>
              <MiniLineChart data={profitTrend} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
