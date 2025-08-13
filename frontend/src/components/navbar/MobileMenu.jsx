import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";
import SupportMenu from "./SupportMenu";
import CartIcon from "./CartIcon";
import ThemeSwitcher from "../ThemeSwitcher";
import { Link } from "react-router-dom";

export default function MobileMenu() {
  return (
    <div className="md:hidden bg-white dark:bg-[#1f1f1f] px-4 py-4 space-y-4">
      <SearchBar />
      <Link
        to="/create-product"
        className="block text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]"
      >
        + Create Product
      </Link>
      <AccountMenu isMobile />
      <SupportMenu isMobile />
      <CartIcon count={2} />
      <ThemeSwitcher />
    </div>
  );
}
