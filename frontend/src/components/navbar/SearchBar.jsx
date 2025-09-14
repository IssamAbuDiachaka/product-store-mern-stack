/**
 * Enhanced SearchBar component that integrates with global search functionality
 * Features: Real-time search, debouncing, better UX, and keyboard navigation
 */

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { TextField } from "@radix-ui/themes";
import { debounce } from "../../utils/helpers";

function SearchBar({ onSearch, loading = false, placeholder = "Search products..." }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchQuery) => {
      onSearch?.(searchQuery);
    }, 300)
  ).current;

  // Handle input changes with debounced search
  const handleInputChange = (value) => {
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Clear search on Escape
      if (e.key === 'Escape' && isFocused) {
        setQuery("");
        onSearch?.("");
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, onSearch]);

  const clearSearch = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <TextField.Root
        ref={inputRef}
        size="3"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full transition-all duration-200 ${
          isFocused ? 'ring-2 ring-blue-200' : ''
        }`}
      >
        <TextField.Slot side="left">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          ) : (
            <Search size={16} className="text-gray-400" />
          )}
        </TextField.Slot>
        
        {query && (
          <TextField.Slot side="right">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              aria-label="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          </TextField.Slot>
        )}
      </TextField.Root>

      {/* Search shortcut hint */}
      {!isFocused && !query && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-200 rounded">
            ⌘K
          </kbd>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
