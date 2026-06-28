import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Breadcrumbs, Link, Avatar } from '@mui/material';
import NextIcon from '@mui/icons-material/NavigateNext';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const breadcrumbs = useBreadcrumb();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶栏 */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: '#FFFFFF', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {/* 面包屑 */}
            <Breadcrumbs separator={<NextIcon sx={{ fontSize: 16 }} />} sx={{ flex: 1 }}>
              {breadcrumbs.map((crumb, idx) => (
                <Link
                  key={crumb.path}
                  underline="hover"
                  color={idx === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
                  sx={{ cursor: 'pointer', fontSize: 14 }}
                  onClick={() => navigate(crumb.path)}
                >
                  {crumb.title}
                </Link>
              ))}
            </Breadcrumbs>

            {/* 全局搜索 */}
            <IconButton sx={{ color: 'text.secondary' }}>
              <SearchIcon />
            </IconButton>

            {/* 用户信息 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.[0] || 'U'}
              </Avatar>
              <Typography variant="body2" sx={{ maxWidth: 80 }} noWrap>
                {user?.name || '用户'}
              </Typography>
              <IconButton size="small" onClick={handleLogout} title="退出登录">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 内容区 */}
        <Box sx={{ flex: 1, p: 3, bgcolor: 'background.default', overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
