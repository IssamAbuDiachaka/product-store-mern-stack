import { LucideShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center space-x-2 text-3xl font-semibold font-lato text-[#fc7645] dark:text-white"
    >
      <LucideShoppingCart size={28} />
      <span>Product Store</span>
    </Link>
  );
}
