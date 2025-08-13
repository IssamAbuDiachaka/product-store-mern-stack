import { LucideShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2 text-2xl font-semibold font-lato text-gray-800 dark:text-white"
    >
      <LucideShoppingCart size={24} />
      <span>Product Store</span>
    </Link>
  );
}
