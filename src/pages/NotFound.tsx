import { Button, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <Typography variant="h1" sx={{ fontSize: 120, fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mt: 2, mb: 4, color: 'text.secondary' }}>
        页面不存在
      </Typography>
      <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')}>
        返回首页
      </Button>
    </Box>
  );
}
