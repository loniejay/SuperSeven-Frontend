'use client';

import React, { useEffect, useState } from 'react';
import { Search } from './styles';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBoxProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDebouncedChange?: (value: string) => void;
  placeholder?: string;
  debounceTime?: number;
  className?: string;
}

export function SearchBox({ 
  searchTerm, 
  onSearchChange,
  onDebouncedChange,
  placeholder = 'Search',
  debounceTime = 500,
  className = ''
}: SearchBoxProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  // Handle debouncing internally
  useEffect(() => {
    if (!onDebouncedChange) return;

    const handler = setTimeout(() => {
      onDebouncedChange(inputValue);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debounceTime, onDebouncedChange]);

  // Sync with external searchTerm changes
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearchChange(e);
  };

  return (
    <Search className={'search-box ' + className}>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        aria-label={placeholder}
      />
      <SearchIcon className="search-icon" />
    </Search>
  );
}