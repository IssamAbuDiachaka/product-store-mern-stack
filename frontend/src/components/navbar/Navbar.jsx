/**
 * Enhanced Navbar component with better responsiveness and modern design
 */

import { useState } from "react";
import { Menu, X, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Flex } from "@radix-ui/themes";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";
import SupportMenu from "./SupportMenu";
import CartIcon from "./CartIcon";
import MobileMenu from "./MobileMenu";
import ThemeSwitcher from "../ThemeSwitcher";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/create-product">
              <Button size="2" variant="soft">
                <Plus size={16} />
                Add Product
              </Button>
            </Link>
            <ThemeSwitcher />
            <AccountMenu />
            <SupportMenu />
            <CartIcon count={2} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <MobileMenu onClose={closeMobileMenu} />
      )}
    </nav>
  );
}

export default Navbar;
