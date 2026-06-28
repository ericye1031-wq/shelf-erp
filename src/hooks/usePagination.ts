import { useState, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function usePagination(initialPageSize = DEFAULT_PAGE_SIZE) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  const handleChangePage = useCallback((_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPagination({ page: 1, pageSize: parseInt(event.target.value, 10), total: pagination.total });
  }, [pagination.total]);

  const setTotal = useCallback((total: number) => {
    setPagination((prev) => ({ ...prev, total }));
  }, []);

  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    handleChangePage,
    handleChangeRowsPerPage,
    setTotal,
    /** MUI TablePagination 兼容的 page（0-based） */
    pageZeroBased: pagination.page - 1,
  };
}
