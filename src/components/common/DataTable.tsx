import { useState, useMemo, type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export interface Column<T> {
  id: string;
  label: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export interface ActionItem<T> {
  label: string;
  onClick: (row: T) => void;
  color?: 'primary' | 'error' | 'warning' | 'info' | 'success';
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  rows: readonly T[];
  rowKey?: keyof T | ((row: T) => string);
  title?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  dense?: boolean;
  emptyText?: string;
  loading?: boolean;
  actions?: ActionItem<T>[];
  onRowClick?: (row: T) => void;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
}

/** 增强表格（MUI Table包装，支持排序/筛选/分页/行选择） */
export default function DataTable<T>({
  columns,
  rows,
  rowKey = 'id' as keyof T,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  page = 0,
  pageSize = 20,
  total,
  onPageChange,
  onPageSizeChange,
  dense = false,
  emptyText = '暂无数据',
  actions = [],
  onRowClick,
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const getRowId = (row: T): string => {
    if (typeof rowKey === 'function') return rowKey(row);
    return String((row as Record<string, unknown>)[rowKey as string] ?? '');
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField];
      const bVal = (b as Record<string, unknown>)[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(getRowId(r)));
  const someSelected = rows.some((r) => selectedIds.includes(getRowId(r))) && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(rows.map(getRowId));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const totalCount = total ?? rows.length;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              {selectable && (
                <TableCell padding="checkbox" sx={{ width: 48 }}>
                  <Checkbox
                    color="primary"
                    indeterminate={someSelected}
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  width={col.width}
                  align={col.align}
                  sx={{ fontWeight: 700, color: '#005591', whiteSpace: 'nowrap' }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 5, px: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 5, color: 'text.secondary' }}>
                    <InboxOutlinedIcon sx={{ fontSize: 48 }} />
                    <Typography variant="body1" color="text.secondary">{emptyText}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedIds.includes(id);
                return (
                  <TableRow
                    key={id}
                    hover
                    selected={isSelected}
                    onClick={selectable ? () => handleSelectRow(id) : onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ cursor: selectable || onRowClick ? 'pointer' : 'default', '&:hover': { backgroundColor: '#F5F5F5' } }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isSelected} />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.id} align={col.align} sx={{ fontSize: '0.875rem' }}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.id] ?? '')}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        {actions.filter((a) => !a.hidden || !a.hidden(row)).map((action) => (
                          <IconButton
                            key={action.label}
                            size="small"
                            color={action.color || 'primary'}
                            onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                            title={action.label}
                          >
                            <Typography variant="caption">{action.label}</Typography>
                          </IconButton>
                        ))}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(onPageChange || onPageSizeChange) && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => onPageChange?.(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="每页行数"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      )}
    </Paper>
  );
}
