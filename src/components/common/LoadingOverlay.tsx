import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
}

/** 加载遮罩（CircularProgress+半透明背景） */
export default function LoadingOverlay({ loading, text = '加载中...' }: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <CircularProgress size={40} sx={{ color: '#005591' }} />
      {text && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {text}
        </Typography>
      )}
    </Box>
  );
}
