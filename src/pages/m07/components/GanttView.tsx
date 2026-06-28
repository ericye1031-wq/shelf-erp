import { Box, Typography, Tooltip } from '@mui/material';
import type { GanttTask } from '@/types/m07';

/** 计算整个时间范围 */
function computeRange(tasks: GanttTask[]) {
  if (!tasks.length) return { min: '', max: '', days: 0 };
  const dates = tasks.flatMap((t) => [new Date(t.startDate).getTime(), new Date(t.endDate).getTime()]);
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  return { min: min.toISOString().slice(0, 10), max: max.toISOString().slice(0, 10), days: Math.max(1, (max.getTime() - min.getTime()) / 86400000) };
}

/** 月份标签生成 */
function monthLabels(startDate: string, totalDays: number) {
  const labels: { label: string; left: number }[] = [];
  const start = new Date(startDate);
  const monthsTotal = Math.ceil(totalDays / 30);
  for (let i = 0; i <= monthsTotal; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const offsetDays = (d.getTime() - start.getTime()) / 86400000;
    if (offsetDays < 0) continue;
    const left = (offsetDays / totalDays) * 100;
    if (left <= 100) {
      labels.push({ label: `${d.getMonth() + 1}月`, left });
    }
  }
  return labels;
}

export default function GanttView({ tasks }: { tasks: GanttTask[] }) {
  if (!tasks.length) {
    return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无甘特数据</Typography>;
  }

  const range = computeRange(tasks);

  if (!range.days) return null;

  const labels = monthLabels(range.min, range.days);
  const BAR_HEIGHT = 32;
  const rowHeight = BAR_HEIGHT + 12;

  return (
    <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
      {/* 月份标签行 */}
      <Box sx={{ position: 'relative', height: 24, mb: 1, ml: '200px' }}>
        {labels.map((l, i) => (
          <Typography
            key={i}
            variant="caption"
            sx={{
              position: 'absolute',
              left: `${l.left}%`,
              transform: 'translateX(-50%)',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {l.label}
          </Typography>
        ))}
      </Box>

      {/* 任务条 */}
      <Box sx={{ position: 'relative' }}>
        {tasks.map((task) => {
          const s = new Date(task.startDate).getTime();
          const e = new Date(task.endDate).getTime();
          const startPct = ((s - new Date(range.min).getTime()) / (range.days * 86400000)) * 100;
          const widthPct = ((e - s) / (range.days * 86400000)) * 100;

          return (
            <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', height: rowHeight, mb: 0.5 }}>
              {/* 任务名称 */}
              <Typography variant="body2" sx={{ width: 200, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.name}
              </Typography>

              {/* 甘特条区域 */}
              <Box sx={{ flex: 1, position: 'relative', height: BAR_HEIGHT }}>
                {/* 网格线 */}
                {labels.map((l, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      left: `${l.left}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      bgcolor: 'divider',
                    }}
                  />
                ))}

                {/* 任务条 */}
                <Tooltip title={`${task.name}: ${task.startDate} ~ ${task.endDate} (${task.progress}%)`}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${Math.max(0, startPct)}%`,
                      width: `${Math.max(1, widthPct)}%`,
                      top: 4,
                      height: BAR_HEIGHT - 8,
                      bgcolor: task.color || '#005591',
                      borderRadius: 1,
                      opacity: 0.85,
                      cursor: 'pointer',
                      '&:hover': { opacity: 1 },
                    }}
                  />
                </Tooltip>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
