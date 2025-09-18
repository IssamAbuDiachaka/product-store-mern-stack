import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Flex } from "@radix-ui/themes";
import Logo from "./Logo";
import CartIcon from "./CartIcon";
import MobileMenu from "./MobileMenu";

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

          {/* Desktop Navigation Links (centered) */}
          <div className="hidden md:flex flex-1 justify-center space-x-6">
            <Link to="/cases" className="text-gray-600 hover:text-gray-900">
              Cases
            </Link>
            <Link to="/straps" className="text-gray-600 hover:text-gray-900">
              Straps
            </Link>
            <Link to="/power-banks" className="text-gray-600 hover:text-gray-900">
              Power Banks
            </Link>
            <Link to="/cables" className="text-gray-600 hover:text-gray-900">
              Cables
            </Link>
            <Link to="/magsafe" className="text-gray-600 hover:text-gray-900">
              MagSafe
            </Link>
            <Link to="/charger" className="text-gray-600 hover:text-gray-900">
              Charger
            </Link>
            <Link to="/more" className="text-gray-600 hover:text-gray-900">
              More
            </Link>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Login / Register
            </Link>
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <CartIcon count={0} />
            </div>
            <span>$0.00</span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <MobileMenu onClose={closeMobileMenu} />
        )}
      </div>
    </nav>
  );
}

export default Navbar;