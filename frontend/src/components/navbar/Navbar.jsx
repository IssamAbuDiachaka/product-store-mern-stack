import { useState } from "react";
import { Menu, X, PlusIcon } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";
import SupportMenu from "./SupportMenu";
import CartIcon from "./CartIcon";
import MobileMenu from "./MobileMenu";
import ThemeSwitcher from "../ThemeSwitcher";
import { Link } from "react-router-dom";

export default function Navbar() {
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
          <Link to="/create-product">
            <button className="bg-[#ff6f3c] hover:bg-[#e65c2b] text-white p-2 rounded-full">
              <PlusIcon size={20} />
            </button>
          </Link>
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
