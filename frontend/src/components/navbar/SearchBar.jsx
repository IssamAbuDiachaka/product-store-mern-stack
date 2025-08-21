import { useState } from "react";
import { Search, X } from "lucide-react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-2xl">
      {/* Input container */}
      <div
        className="flex items-center border border-gray-300
                   rounded-lg px-4 py-2
                   shadow-sm focus-within:shadow-md
                   transition-shadow duration-200 w-full"
      >
        <Search
          className="text-gray-500 dark:text-gray-400 "
          size={20}
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search products..."
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 outline-none px-3 text-gray-800 dark:text-gray-200 bg-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="bg-[#fc7645] hover:bg-[#e65c2b] text-white px-3 py-2 rounded-lg
                   transition-colors duration-200 whitespace-nowrap cursor-pointer"
      >
        Search
      </button>
    </div>
  );
}
export default SearchBar;
