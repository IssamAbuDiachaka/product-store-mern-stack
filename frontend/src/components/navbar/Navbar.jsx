import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";
import SupportMenu from "./SupportMenu";
import CartIcon from "./CartIcon";
import MobileMenu from "./MobileMenu";
import ThemeSwitcher from "../ThemeSwitcher";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6 gap-4">
        {/* Logo */}
        <Logo />

        {/* Search (takes max available space) */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Right Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <ThemeSwitcher />
          <AccountMenu />
          <SupportMenu />
          <CartIcon count={2} />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-800 dark:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && <MobileMenu />}
    </nav>
  );
}
export default Navbar;
