import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM13Store } from '@/stores/useM13Store';
import { formatMoney } from '@/utils/format';
import dayjs from 'dayjs';

export default function FundDailyReportPage() {
  const { fundReport, loading, error, fetchFundDailyReport } = useM13Store();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => { fetchFundDailyReport(date); }, [fetchFundDailyReport, date]);

  const handleRefresh = () => fetchFundDailyReport(date);

  return (
    <>
      <PageHeader title="资金日报" subtitle={fundReport ? `报表日期: ${fundReport.date}` : undefined}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField type="date" size="small" value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 180 }} />
            <Button variant="contained" startIcon={<RefreshIcon />}
              onClick={handleRefresh} sx={{ backgroundColor: '#005591' }}>查询</Button>
          </Box>} />
      {error && <Box sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderRadius: 1, color: 'error.main' }}>错误：{error}</Box>}

      <Box sx={{ position: 'relative' }}>
        <LoadingOverlay loading={loading} />

        {fundReport && (
          <>
            {/* 汇总卡片 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: '总余额', value: formatMoney(fundReport.summary.totalBalance), color: '#1565c0' },
                { label: '当日流入', value: formatMoney(fundReport.summary.totalIn), color: '#2e7d32' },
                { label: '当日流出', value: formatMoney(fundReport.summary.totalOut), color: '#d32f2f' },
                { label: '净流量', value: formatMoney(fundReport.summary.netFlow), color: fundReport.summary.netFlow >= 0 ? '#2e7d32' : '#d32f2f' },
              ].map((card) => (
                <Grid key={card.label} size={{ xs: 6, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                      <Typography variant="h6" sx={{ color: card.color, fontWeight: 700 }}>{card.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* 账户明细 */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>账户名称</TableCell>
                    <TableCell>银行</TableCell>
                    <TableCell>账号</TableCell>
                    <TableCell align="right">当前余额</TableCell>
                    <TableCell align="right">当日流入</TableCell>
                    <TableCell align="right">当日流出</TableCell>
                    <TableCell align="center">流水笔数</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fundReport.accounts.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell>{acc.name}</TableCell>
                      <TableCell>{acc.bankName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{acc.accountNo}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMoney(acc.balance)}</TableCell>
                      <TableCell align="right" sx={{ color: '#2e7d32' }}>
                        {acc.totalIn > 0 ? `+${formatMoney(acc.totalIn)}` : formatMoney(acc.totalIn)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#d32f2f' }}>
                        {acc.totalOut > 0 ? `-${formatMoney(acc.totalOut)}` : formatMoney(acc.totalOut)}
                      </TableCell>
                      <TableCell align="center">{acc.txCount}</TableCell>
                    </TableRow>
                  ))}
                  {fundReport.accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        暂无账户数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {!fundReport && !loading && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            请选择日期查询资金日报
          </Box>
        )}
      </Box>
    </>
  );
}
