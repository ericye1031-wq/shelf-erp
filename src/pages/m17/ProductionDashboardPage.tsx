import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, LinearProgress, IconButton
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PageHeader from '@/components/common/PageHeader';

interface KpiCard {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  color: string;
  subtitle: string;
}

interface DailyOutput {
  date: string;
  tons: number;
  target: number;
}

function OEEGauge({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 85 ? '#2E7D32' : pct >= 70 ? '#E65100' : '#C62828';
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h3" fontWeight={700} color={color}>{pct.toFixed(1)}%</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <LinearProgress variant="determinate" value={pct}
        sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: '#E0E0E0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
    </Box>
  );
}

function MiniBarChart({ data, maxTons }: { data: DailyOutput[]; maxTons: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 120, mt: 1 }}>
      {data.map((d) => {
        const h = maxTons > 0 ? (d.tons / maxTons) * 100 : 0;
        return (
          <Box key={d.date} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ fontSize: 9 }}>{d.tons.toFixed(1)}</Typography>
            <Box sx={{ width: '100%', height: `${h}%`, bgcolor: d.tons >= d.target ? '#2E7D32' : '#005591', borderRadius: '2px 2px 0 0', minHeight: 2, transition: 'height 0.3s' }} />
            <Typography variant="caption" sx={{ fontSize: 8, mt: 0.5, transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
              {d.date.slice(5)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default function ProductionDashboardPage() {
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-28');

  const kpis: KpiCard[] = useMemo(() => [
    { title: '当日产量(吨)', value: '286.5', trend: 'up', trendValue: '+8.2%', color: '#005591', subtitle: 'vs 昨日 264.8' },
    { title: '计划达成率', value: '104.2%', trend: 'up', trendValue: '+2.1%', color: '#2E7D32', subtitle: '目标 100%' },
    { title: 'OEE %', value: '87.3%', trend: 'down', trendValue: '-1.5%', color: '#1565C0', subtitle: '上月 88.8%' },
    { title: '不良率', value: '0.82%', trend: 'down', trendValue: '-0.15%', color: '#E65100', subtitle: '阈值 1.5%' },
  ], []);

  const dailyOutput: DailyOutput[] = useMemo(() => {
    const data: DailyOutput[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(2026, 5, 15 + i);
      const date = d.toISOString().slice(0, 10);
      data.push({ date, tons: 240 + Math.random() * 80, target: 275 });
    }
    return data;
  }, []);

  const maxTons = Math.max(...dailyOutput.map((d) => d.tons));
  const oeeMetrics = [
    { label: '可用性', value: 92.1 },
    { label: '性能', value: 95.8 },
    { label: '质量', value: 99.0 },
  ];

  return (
    <>
      <PageHeader title="生产仪表板" subtitle="实时生产KPI与OEE监控" />

      {/* Date Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField type="date" label="开始日期" size="small"
          value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }} />
        <TextField type="date" label="结束日期" size="small"
          value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }} />
        <Button variant="outlined" startIcon={<CalendarMonthIcon />} size="small">本周</Button>
        <Button variant="outlined" size="small">本月</Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 6, sm: 3 }} key={kpi.title}>
            <Card variant="outlined" sx={{ borderLeft: 4, borderColor: kpi.color }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">{kpi.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                  <Typography variant="h5" fontWeight={700} color={kpi.color}>{kpi.value}</Typography>
                  <Chip
                    icon={kpi.trend === 'up' ? <TrendingUpIcon /> : kpi.trend === 'down' ? <TrendingDownIcon /> : undefined}
                    label={kpi.trendValue}
                    size="small"
                    color={kpi.trend === 'up' ? 'success' : kpi.trend === 'down' ? 'error' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">{kpi.subtitle}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Daily Output Bar Chart */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>每日产量 (吨)</Typography>
          <MiniBarChart data={dailyOutput} maxTons={maxTons} />
          <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#005591', borderRadius: '2px' }} />
              <Typography variant="caption">实际</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#2E7D32', borderRadius: '2px' }} />
              <Typography variant="caption">达标</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* OEE Gauge Section */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>OEE 分解</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <OEEGauge value={87.3} label="综合 OEE" />
            </Grid>
            {oeeMetrics.map((m) => (
              <Grid size={{ xs: 12, sm: 3 }} key={m.label}>
                <OEEGauge value={m.value} label={m.label} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
