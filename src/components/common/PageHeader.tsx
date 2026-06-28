import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** 页面标题+副标题+右侧操作按钮区 */
export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#005591">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Stack direction="row" spacing={1}>{action}</Stack>}
    </Box>
  );
}
