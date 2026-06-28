import { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface BomTreeNode {
  partCode: string;
  partName: string;
  material: string;
  spec: string;
  quantity: number;
  unit: string;
  children?: BomTreeNode[];
}

export interface BomTreeProps {
  data: BomTreeNode[];
  showCost?: boolean;
  onNodeClick?: (node: BomTreeNode) => void;
}

/** BOM树展开组件（递归树+物料数量+层级缩进） */
export default function BomTree({ data, showCost = false, onNodeClick }: BomTreeProps) {
  return (
    <Box>
      {data.map((node, idx) => (
        <BomNode key={`${node.partCode}-${idx}`} node={node} depth={0} showCost={showCost} onNodeClick={onNodeClick} />
      ))}
    </Box>
  );
}

interface BomNodeProps {
  node: BomTreeNode;
  depth: number;
  showCost: boolean;
  onNodeClick?: (node: BomTreeNode) => void;
}

function BomNode({ node, depth, showCost, onNodeClick }: BomNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box>
      <Box
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onNodeClick?.(node);
        }}
        sx={{
          display: 'grid',
          gridTemplateColumns: hasChildren ? '20px 1fr 80px 60px 100px' : '20px 1fr 80px 60px 100px',
          alignItems: 'center',
          gap: 1,
          pl: depth * 2.5,
          py: 0.8,
          px: 1,
          cursor: 'pointer',
          borderRadius: 1,
          '&:hover': { backgroundColor: '#F5F5F5' },
          borderBottom: '1px solid #F5F5F5',
        }}
      >
        {/* 展开/折叠图标 */}
        {hasChildren ? (
          expanded ? (
            <ExpandMoreIcon sx={{ fontSize: 16, color: '#2271B3' }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 16, color: '#999' }} />
          )
        ) : (
          <Box sx={{ width: 16 }} />
        )}

        {/* 物料名称 */}
        <Typography variant="body2" sx={{ fontWeight: depth === 0 ? 700 : 400, color: '#333' }}>
          {node.partName}
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {node.partCode}
          </Typography>
        </Typography>

        {/* 数量 */}
        <Typography variant="body2" color="#005591" fontWeight={600} textAlign="right">
          {node.quantity} {node.unit}
        </Typography>

        {/* 材料 */}
        <Typography variant="caption" color="text.secondary">
          {node.material}
        </Typography>

        {/* 规格 */}
        <Typography variant="caption" color="text.secondary" noWrap>
          {node.spec}
        </Typography>
      </Box>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto">
          {node.children!.map((child, idx) => (
            <BomNode
              key={`${child.partCode}-${idx}`}
              node={child}
              depth={depth + 1}
              showCost={showCost}
              onNodeClick={onNodeClick}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}
