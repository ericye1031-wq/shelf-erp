import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  filterSlot?: React.ReactNode;
}

/** 搜索输入+筛选下拉 */
export default function SearchBar({ placeholder = '搜索...', value, onChange, filterSlot }: SearchBarProps) {
  const [internal, setInternal] = useState('');
  const val = value ?? internal;

  const handleChange = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={val}
        onChange={(e) => handleChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: '#2271B3' }} />
            </InputAdornment>
          ),
          endAdornment: val ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => handleChange('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
      {filterSlot}
    </Box>
  );
}
