import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface TimelineItem {
  title: string;
  time: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

/** 时间线组件（纵向时间节点列表） */
export default function Timeline({ items }: TimelineProps) {
  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      {/* 竖线 */}
      <Box
        sx={{
          position: 'absolute',
          left: 11,
          top: 8,
          bottom: 8,
          width: 2,
          backgroundColor: '#E0E0E0',
        }}
      />
      {items.map((item, index) => (
        <Box key={index} sx={{ position: 'relative', pb: index === items.length - 1 ? 0 : 2.5 }}>
          {/* 圆点 */}
          <Box
            sx={{
              position: 'absolute',
              left: -21,
              top: 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: item.color ?? '#005591',
              border: '2px solid #fff',
              boxShadow: '0 0 0 2px ' + (item.color ?? '#005591'),
            }}
          />
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, ml: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.icon}
              <Typography variant="subtitle2" fontWeight={700} color="#005591">
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {item.time}
              </Typography>
            </Box>
            {item.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {item.description}
              </Typography>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
