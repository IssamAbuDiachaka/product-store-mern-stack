import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
  return (
    <div className="flex items-center w-full md:w-1/3 bg-gray-100 dark:bg-[#2d2d2d] rounded-full px-3">
      <Search className="text-gray-500 dark:text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Search products..."
        className="flex-1 bg-transparent outline-none px-2 text-gray-800 dark:text-gray-200"
      />
      <button
        onClick={onSearch}
        className="bg-[#ff6f3c] hover:bg-[#e65c2b] text-white px-4 py-2 rounded-full"
      >
        Search
      </button>
    </div>
  );
}
