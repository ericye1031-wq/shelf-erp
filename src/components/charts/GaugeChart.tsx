import { Box } from '@mui/material';

export interface GaugeChartProps {
  value: number;       // 0~1 or 0~max
  label: string;
  size?: number;
  thickness?: number;
  max?: number;        // optional max value for scaling
}

/** 仪表盘图（纯SVG圆弧，用于OEE等指标展示） */
export default function GaugeChart({ value, label, size = 160, thickness = 14, max }: GaugeChartProps) {
  const clampedValue = Math.max(0, Math.min(1, max ? value / max : value));
  const center = size / 2;
  const radius = (size - thickness) / 2;

  // 颜色：>0.8绿 >0.6蓝 >0.4橙 ≤0.4红
  let color = '#4CAF50';
  if (clampedValue <= 0.4) color = '#F44611';
  else if (clampedValue <= 0.6) color = '#FF9800';
  else if (clampedValue <= 0.8) color = '#2271B3';

  const percent = (clampedValue * 100).toFixed(1);

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* 背景弧 */}
        <path
          d={describeArc(center, center, radius, Math.PI, 0)}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {/* 值弧 */}
        {clampedValue > 0 && (
          <path
            d={describeArc(center, center, radius, Math.PI, Math.PI - Math.PI * clampedValue)}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        )}
        {/* 数值 */}
        <text x={center} y={center - 8} textAnchor="middle" fontSize={28} fontWeight={700} fill="#333">
          {percent}%
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fontSize={12} fill="#999">
          {label}
        </text>
      </svg>
    </Box>
  );
}

/** 描述SVG弧线 */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const startX = cx + r * Math.cos(startAngle);
  const startY = cy - r * Math.sin(startAngle);
  const endX = cx + r * Math.cos(endAngle);
  const endY = cy - r * Math.sin(endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
}
