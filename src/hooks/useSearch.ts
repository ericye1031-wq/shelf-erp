import { useState, useCallback, useMemo } from 'react';

export function useSearch<T extends Record<string, unknown>>(items: T[], searchFields: (keyof T)[]) {
  const [keyword, setKeyword] = useState('');

  const filteredItems = useMemo(() => {
    if (!keyword.trim()) return items;
    const lower = keyword.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
      }),
    );
  }, [items, keyword, searchFields]);

  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  return { keyword, filteredItems, handleSearch };
}
