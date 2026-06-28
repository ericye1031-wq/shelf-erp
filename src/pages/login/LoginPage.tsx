import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Button, Box, Typography, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 后端通过 TransformInterceptor 返回 {code:0, data:{accessToken,...}, message:'ok'}
      // 前端 api.ts interceptor 已自动 unwrap → res.data = {accessToken, refreshToken, user}
      const res = await api.post('/m01/auth/login', { username, password });
      const { accessToken, user } = res.data;
      if (accessToken && user) {
        login(accessToken, user, user.permissions || user.roles || []);
        navigate('/dashboard', { replace: true });
        return;
      }
      setError('登录响应异常');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '网络错误，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/m01/auth/login', { username: 'admin', password: 'admin123' });
      const { accessToken, user } = res.data;
      login(accessToken, user, user.permissions || user.roles || []);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError('演示登录失败: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: 420, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" align="center" sx={{ mb: 1, color: 'primary.main', fontWeight: 700 }}>
          货架制造业ERP
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          一体化管理平台
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            size="small"
            required
          />
          <FormControlLabel
            control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />}
            label="记住我"
            sx={{ mt: 1 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, py: 1.2 }}
          >
            登 录
          </Button>
        </Box>

        <Button
          type="button"
          fullWidth
          variant="outlined"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDemoLogin(); }}
          sx={{ mt: 1.5, py: 1.2 }}
          disabled={loading}
        >
          演示模式登录
        </Button>

        <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          测试账号：admin / admin123
        </Typography>
      </CardContent>
    </Card>
  );
}
