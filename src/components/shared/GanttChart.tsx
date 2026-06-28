import { useMemo, Fragment } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';

export interface GanttTaskItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  assignee: string;
  color: string;
  dependency: string | null;
}

export interface GanttChartProps {
  tasks: GanttTaskItem[];
  height?: number;
}

/** 甘特图组件（CSS Grid布局+SVG任务条） */
export default function GanttChart({ tasks, height = 400 }: GanttChartProps) {
  const { minDate, totalDays, dayWidth } = useMemo(() => {
    if (tasks.length === 0) return { minDate: dayjs(), totalDays: 1, dayWidth: 40 };
    const starts = tasks.map((t) => dayjs(t.startDate));
    const ends = tasks.map((t) => dayjs(t.endDate));
    const min = starts.reduce((a, b) => (a.isBefore(b) ? a : b));
    const max = ends.reduce((a, b) => (a.isAfter(b) ? b : a));
    const days = max.diff(min, 'day') + 1;
    const chartWidth = Math.max(tasks.length * 30, days * 20);
    return { minDate: min, totalDays: days, dayWidth: Math.max(20, chartWidth / days) };
  }, [tasks]);

  const rowHeight = 36;
  const headerHeight = 40;
  const labelWidth = 160;
  const chartWidth = totalDays * dayWidth;

  const getTaskX = (date: string) => dayjs(date).diff(minDate, 'day') * dayWidth;
  const getTaskWidth = (start: string, end: string) => (dayjs(end).diff(dayjs(start), 'day') + 1) * dayWidth;

  // 生成日期刻度
  const ticks = useMemo(() => {
    const result: { label: string; x: number }[] = [];
    for (let i = 0; i <= totalDays; i += Math.max(1, Math.floor(totalDays / 10))) {
      const d = minDate.add(i, 'day');
      result.push({ label: d.format('MM/DD'), x: i * dayWidth });
    }
    return result;
  }, [minDate, totalDays, dayWidth]);

  if (tasks.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">暂无甘特图数据</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: height }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: `${labelWidth}px ${chartWidth}px`, minWidth: labelWidth + chartWidth }}>
          {/* 左上角空白 */}
          <Box sx={{ height: headerHeight, borderBottom: '1px solid #E0E0E0', backgroundColor: '#F5F5F5' }} />

          {/* 时间轴头部 */}
          <Box sx={{ position: 'relative', height: headerHeight, borderBottom: '1px solid #E0E0E0', backgroundColor: '#F5F5F5' }}>
            <svg width={chartWidth} height={headerHeight}>
              {ticks.map((tick, i) => (
                <g key={i}>
                  <line x1={tick.x} y1={headerHeight - 10} x2={tick.x} y2={headerHeight} stroke="#999" strokeWidth={1} />
                  <text x={tick.x} y={16} fontSize={11} fill="#666">{tick.label}</text>
                </g>
              ))}
            </svg>
          </Box>

          {/* 任务行 */}
          {tasks.map((task, index) => (
            <Fragment key={task.id}>
              {/* 任务名 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  height: rowHeight,
                  borderBottom: '1px solid #F0F0F0',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                  {task.name}
                </Typography>
              </Box>

              {/* 任务条区域 */}
              <Box
                sx={{
                  position: 'relative',
                  height: rowHeight,
                  borderBottom: '1px solid #F0F0F0',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <svg width={chartWidth} height={rowHeight}>
                  {/* 任务条背景 */}
                  <rect
                    x={getTaskX(task.startDate)}
                    y={6}
                    width={getTaskWidth(task.startDate, task.endDate)}
                    height={rowHeight - 12}
                    rx={4}
                    fill={task.color}
                    opacity={0.2}
                  />
                  {/* 任务条进度 */}
                  <rect
                    x={getTaskX(task.startDate)}
                    y={6}
                    width={getTaskWidth(task.startDate, task.endDate) * (task.progress / 100)}
                    height={rowHeight - 12}
                    rx={4}
                    fill={task.color}
                    opacity={0.7}
                  />
                  {/* 任务名标注 */}
                  <text
                    x={getTaskX(task.startDate) + 6}
                    y={rowHeight / 2 + 4}
                    fontSize={10}
                    fill="#333"
                    fontWeight={500}
                  >
                    {task.assignee} {task.progress}%
                  </text>
                </svg>
              </Box>
            </Fragment>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
