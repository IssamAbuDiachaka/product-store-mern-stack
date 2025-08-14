import { Headphones, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function SupportMenu({ isMobile }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative ${isMobile ? "w-full" : ""}`}
      onMouseEnter={!isMobile ? () => setOpen(true) : undefined}
      onMouseLeave={!isMobile ? () => setOpen(false) : undefined}
    >
      <button
        onClick={isMobile ? () => setOpen(!open) : undefined}
        className="flex items-center justify-between w-full text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c] cursor-pointer"
      >
        <span className="flex items-center space-x-1">
          <Headphones size={20} />
          <span>Support</span>
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          className={`${
            isMobile ? "pl-4 mt-2 space-y-2" : "absolute right-0 mt-2 w-48 bg-white dark:bg-[#2d2d2d] shadow-lg rounded"
          }`}
        >
          <Link
            to="/faq"
            className={`block hover:text-[#ff6f3c] ${
              isMobile ? "" : "px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            className={`block hover:text-[#ff6f3c] ${
              isMobile ? "" : "px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Contact Us
          </Link>
          <Link
            to="/live-chat"
            className={`block hover:text-[#ff6f3c] ${
              isMobile ? "" : "px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Live Chat
          </Link>
        </div>
      )}
    </div>
  );
}
