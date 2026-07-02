import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useM07Store } from '@/stores/useM07Store';
import type { GanttTask } from '@/types/m07';

const STATUS_COLORS: Record<string, string> = {
  planning: '#9E9E9E',
  in_progress: '#1976D2',
  completed: '#2E7D32',
  delayed: '#D32F2F',
};
const STATUS_LABELS: Record<string, string> = {
  planning: '规划中', in_progress: '进行中', completed: '已完成', delayed: '已延误',
};

function getRange(tasks: GanttTask[]) {
  if (!tasks.length) return { min: '', max: '', days: 0 };
  const dates = tasks.flatMap((t) => [new Date(t.startDate).getTime(), new Date(t.endDate).getTime()]);
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  const days = Math.max(1, (max.getTime() - min.getTime()) / 86400000);
  return { min: min.toISOString().slice(0, 10), max: max.toISOString().slice(0, 10), days };
}

export default function GanttPage() {
  const { projects, ganttTasks, loading, fetchProjects, fetchGanttTasks } = useM07Store();
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    if (selectedProject) fetchGanttTasks(selectedProject);
  }, [selectedProject, fetchGanttTasks]);

  const range = useMemo(() => getRange(ganttTasks), [ganttTasks]);
  const BAR_HEIGHT = 28;
  const ROW_H = BAR_HEIGHT + 12;

  const bars = useMemo(() => ganttTasks.map((t) => {
    const s = new Date(t.startDate).getTime();
    const e = new Date(t.endDate).getTime();
    const rangeStart = new Date(range.min).getTime();
    const rangeMs = range.days * 86400000;
    return {
      ...t,
      leftPct: ((s - rangeStart) / rangeMs) * 100,
      widthPct: Math.max(1, ((e - s) / rangeMs) * 100),
    };
  }), [ganttTasks, range]);

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay loading={loading} />
      <PageHeader title="甘特图" />

      <FormControl size="small" sx={{ mb: 2, minWidth: 260 }}>
        <InputLabel>选择项目</InputLabel>
        <Select value={selectedProject} label="选择项目" onChange={(e) => setSelectedProject(e.target.value)}>
          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </Select>
      </FormControl>

      {!selectedProject || ganttTasks.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          {selectedProject ? '该项目暂无甘特数据' : '请选择一个项目查看甘特图'}
        </Typography>
      ) : (
        <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
          {/* 时间轴 */}
          <Box sx={{ position: 'relative', height: 22, ml: '180px' }}>
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <Typography
                key={p}
                variant="caption"
                sx={{
                  position: 'absolute', left: `${p * 100}%`,
                  transform: 'translateX(-50%)', color: 'text.secondary', whiteSpace: 'nowrap',
                }}
              >
                {new Date(new Date(range.min).getTime() + range.days * 86400000 * p).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </Typography>
            ))}
          </Box>

          {/* 甘特条 */}
          {bars.map((b) => (
            <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', height: ROW_H, mb: 0.5 }}>
              <Typography variant="body2" sx={{ width: 180, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                {b.name}
              </Typography>
              <Box sx={{ flex: 1, position: 'relative', height: BAR_HEIGHT }}>
                {/* 网格线 */}
                {[0.25, 0.5, 0.75].map((p) => (
                  <Box key={p} sx={{ position: 'absolute', left: `${p * 100}%`, top: 0, bottom: 0, width: 1, bgcolor: 'divider' }} />
                ))}
                <Tooltip title={`${b.name}: ${b.startDate} ~ ${b.endDate} (${b.progress}%)`}>
                  <Box
                    sx={{
                      position: 'absolute', left: `${Math.max(0, b.leftPct)}%`,
                      width: `${b.widthPct}%`, top: 3, height: BAR_HEIGHT - 6,
                      bgcolor: STATUS_COLORS[b.status] || '#1976D2',
                      borderRadius: 1, opacity: 0.85, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', pl: 1,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#fff', fontSize: 10, fontWeight: 600 }} noWrap>
                      {b.name}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          ))}

          {/* 图例 */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: STATUS_COLORS[k] }} />
                <Typography variant="caption">{v}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
