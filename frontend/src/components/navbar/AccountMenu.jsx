import { User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function AccountMenu({ isMobile }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative ${isMobile ? "w-full" : ""}`}
      onMouseEnter={!isMobile ? () => setOpen(true) : undefined}
      onMouseLeave={!isMobile ? () => setOpen(false) : undefined}
    >
      <button
        onClick={isMobile ? () => setOpen(!open) : undefined}
        className="flex items-center justify-between w-full text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]"
      >
        <span className="flex items-center space-x-1">
          <User size={20} />
          <span>Account</span>
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          className={`${
            isMobile ? "pl-4 mt-2 space-y-2" : "absolute right-0 mt-2 w-40 bg-white dark:bg-[#2d2d2d] shadow-lg rounded"
          }`}
        >
          <Link
            to="/login"
            className={`block hover:text-[#ff6f3c] ${
              isMobile ? "" : "px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Login / Register
          </Link>
        </div>
      )}
    </div>
  );
}
