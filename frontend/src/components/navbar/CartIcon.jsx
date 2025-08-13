import { LucideShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartIcon({ count }) {
  return (
    <Link to="/cart" className="relative">
      <LucideShoppingCart
        size={24}
        className="text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]"
      />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#ff6f3c] text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
