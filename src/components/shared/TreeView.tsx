import React, { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface TreeDataItem {
  id: string;
  name: string;
  children?: TreeDataItem[];
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

export interface TreeViewProps {
  data: TreeDataItem[];
  selectedId?: string;
  onSelect?: (id: string, item: TreeDataItem) => void;
  defaultExpandAll?: boolean;
}

/** 通用树形视图（递归渲染，展开/折叠，点击选中） */
export default function TreeView({ data, selectedId, onSelect, defaultExpandAll = false }: TreeViewProps) {
  return (
    <Box>
      {data.map((item) => (
        <TreeItem
          key={item.id}
          item={item}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          defaultExpandAll={defaultExpandAll}
        />
      ))}
    </Box>
  );
}

interface TreeItemProps {
  item: TreeDataItem;
  depth: number;
  selectedId?: string;
  onSelect?: (id: string, item: TreeDataItem) => void;
  defaultExpandAll: boolean;
}

function TreeItem({ item, depth, selectedId, onSelect, defaultExpandAll }: TreeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpandAll);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedId === item.id;

  const handleClick = () => {
    if (hasChildren) setExpanded(!expanded);
    onSelect?.(item.id, item);
  };

  return (
    <Box>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pl: depth * 2.5,
          py: 0.6,
          cursor: 'pointer',
          borderRadius: 1,
          backgroundColor: isSelected ? '#E3F2FD' : 'transparent',
          '&:hover': { backgroundColor: isSelected ? '#E3F2FD' : '#F5F5F5' },
          transition: 'background-color 0.15s',
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ExpandMoreIcon sx={{ fontSize: 18, color: '#2271B3' }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 18, color: '#999' }} />
          )
        ) : (
          <Box sx={{ width: 18 }} />
        )}
        {item.icon}
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? 700 : 400,
            color: isSelected ? '#005591' : '#333',
            flex: 1,
          }}
        >
          {item.name}
        </Typography>
        {item.extra}
      </Box>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto">
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpandAll={defaultExpandAll}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}
