import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const mockDeviations = [
  { label: '预算总额', value: '¥ 580,000', color: '#333' },
  { label: '实际成本', value: '¥ 612,300', color: '#e53935' },
  { label: '偏差率', value: '+5.57%', color: '#e53935', icon: <TrendingUpIcon fontSize="small" /> },
  { label: '人工成本', value: '¥ 185,000', color: '#333' },
  { label: '材料成本', value: '¥ 320,000', color: '#333' },
  { label: '外包成本', value: '¥ 107,300', color: '#f57c00', icon: <TrendingUpIcon fontSize="small" /> },
];

export default function CostDeviation() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>成本偏差分析</Typography>
        <Grid container spacing={3}>
          {mockDeviations.map((item) => (
            <Grid item xs={6} sm={4} key={item.label}>
              <Typography variant="body2" color="text.secondary" gutterBottom>{item.label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: item.color }}>
                  {item.value}
                </Typography>
                {item.icon}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
