import { useState } from "react";
import { Search, X } from "lucide-react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
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
    <div className="flex items-center gap-2">
      {/* Input container */}
      <div
        className="flex items-center bg-gray-100 dark:bg-[#2d2d2d] 
                   rounded-full px-3 py-1 shadow-sm focus-within:shadow-md 
                   transition-shadow duration-200 w-full md:w-72"
      >
        <Search
          className="text-gray-500 dark:text-gray-400"
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
          className="flex-1 bg-transparent outline-none px-2 text-gray-800 dark:text-gray-200"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search button outside */}
      <button
        onClick={handleSearch}
        className="bg-[#ff6f3c] hover:bg-[#e65c2b] text-white px-4 py-1.5 rounded-full transition-colors duration-200"
      >
        Search
      </button>
    </div>
  );
}
export default SearchBar;
