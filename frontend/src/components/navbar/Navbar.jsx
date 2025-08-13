import { useState } from "react";
import { Menu, X, PlusIcon } from "lucide-react";
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
    <nav className="bg-white dark:bg-[#1f1f1f] shadow-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
       
        <Logo />

        {/* Search */}
        <div className="hidden md:flex">
          <SearchBar />
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <AccountMenu />
          <SupportMenu />
          <CartIcon count={2} />
          <ThemeSwitcher />
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