import { useEffect, useState } from 'react';
import {
  Box, TextField, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Collapse, Chip, Paper,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM10Store } from '@/stores/useM10Store';
import type { ProcessRoute } from '@/types/m10';

export default function ProcessRoutePage() {
  const { processRoutes, loading, fetchProcessRoutes } = useM10Store();
  const [shelfTypeId, setShelfTypeId] = useState('default');
  const [expandId, setExpandId] = useState<string | null>(null);

  useEffect(() => { fetchProcessRoutes(shelfTypeId); }, [fetchProcessRoutes, shelfTypeId]);

  const handleSearch = () => {
    if (shelfTypeId.trim()) fetchProcessRoutes(shelfTypeId.trim());
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="工艺路线" subtitle="管理货架类型的工艺路线和工序步骤" />
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small" label="货架类型ID"
          value={shelfTypeId} onChange={(e) => setShelfTypeId(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          sx={{ minWidth: 200 }}
        />
      </Box>
      {!processRoutes.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无工艺路线数据</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ width: 48 }} />
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>路线编码</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>路线名称</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }}>货架类型</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">标准总工时(min)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#005591' }} align="right">工序数</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processRoutes.map((route) => (
                <RouteRow
                  key={route.id}
                  route={route}
                  expanded={expandId === route.id}
                  onToggle={() => setExpandId(expandId === route.id ? null : route.id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

/** 可展开的工艺路线行 */
function RouteRow({ route, expanded, onToggle }: {
  route: ProcessRoute;
  expanded: boolean;
  onToggle: () => void;
}) {
  const steps = route.steps ?? [];
  const stdTotalHours = steps.reduce((sum, s) => sum + (s.standardMinutes || 0), 0);

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F5F5F5' } }} onClick={onToggle}>
        <TableCell>
          <IconButton size="small">{expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>{route.id}</Typography>
        </TableCell>
        <TableCell>{route.name}</TableCell>
        <TableCell>
          <Chip label={route.shelfTypeId} size="small" variant="outlined" />
        </TableCell>
        <TableCell align="right">{stdTotalHours}</TableCell>
        <TableCell align="right">
          <Chip label={steps.length} size="small" color="primary" variant="outlined" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, borderBottom: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, py: 2, backgroundColor: '#FAFAFA' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#005591' }}>工序步骤序列</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>序号</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>工序编码</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>工序名称</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>设备类型</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">标准工时(min)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>依赖工序</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {steps.map((step, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{step.sequence}</TableCell>
                      <TableCell>{step.stepCode}</TableCell>
                      <TableCell>{step.stepName}</TableCell>
                      <TableCell>{step.equipmentType || '-'}</TableCell>
                      <TableCell align="right">{step.standardMinutes}</TableCell>
                      <TableCell>{step.dependency || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
