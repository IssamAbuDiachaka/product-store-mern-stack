import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LucideShoppingCart,
  PlusIcon,
  Search,
  User,
  ChevronDown,
  Headphones,
  Menu,
  X,
} from "lucide-react";
import ThemeSwitcher from "../components/ThemeSwitcher";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-[#1f1f1f] shadow-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-2xl font-semibold font-lato text-gray-800 dark:text-white"
        >
          <LucideShoppingCart size={24} />
          <span>Product Storage</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center w-1/3 bg-gray-100 dark:bg-[#2d2d2d] rounded-full px-3">
          <Search className="text-gray-500 dark:text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none px-2 text-gray-800 dark:text-gray-200"
          />
          <button className="bg-[#ff6f3c] hover:bg-[#e65c2b] text-white px-4 py-2 rounded-full">
            Search
          </button>
        </div>

        {/* Right: Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Create Product */}
          <Link to="/create-product">
            <button className="bg-[#ff6f3c] hover:bg-[#e65c2b] text-white p-2 rounded-full">
              <PlusIcon size={20} />
            </button>
          </Link>

          {/* Account Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <button className="flex items-center space-x-1 text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]">
              <User size={20} />
              <span>Account</span>
              <ChevronDown size={16} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2d2d2d] shadow-lg rounded">
                <Link
                  to="/login"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>

          {/* Support Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSupportOpen(true)}
            onMouseLeave={() => setSupportOpen(false)}
          >
            <button className="flex items-center space-x-1 text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]">
              <Headphones size={20} />
              <span>Support</span>
              <ChevronDown size={16} />
            </button>
            {supportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2d2d2d] shadow-lg rounded">
                <Link
                  to="/faq"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  FAQ
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Contact Us
                </Link>
                <Link
                  to="/live-chat"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Live Chat
                </Link>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <LucideShoppingCart
              size={24}
              className="text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]"
            />
            <span className="absolute -top-2 -right-2 bg-[#ff6f3c] text-white text-xs px-2 py-0.5 rounded-full">
              2
            </span>
          </Link>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-800 dark:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1f1f1f] px-4 py-4 space-y-4">
          {/* Search */}
          <div className="flex items-center bg-gray-100 dark:bg-[#2d2d2d] rounded-full px-3">
            <Search className="text-gray-500 dark:text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 bg-transparent outline-none px-2 text-gray-800 dark:text-gray-200"
            />
            <button className="bg-[#ff6f3c] hover:bg-[#e65c2b] text-white px-4 py-2 rounded-full">
              Search
            </button>
          </div>

          {/* Links */}
          <Link
            to="/create-product"
            className="block text-gray-800 dark:text-gray-200 hover:text-[#ff6f3c]"
          >
            + Create Product
          </Link>

          <div>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex justify-between items-center w-full text-gray-800 dark:text-gray-200"
            >
              Account <ChevronDown size={16} />
            </button>
            {accountOpen && (
              <div className="pl-4 mt-2 space-y-2">
                <Link
                  to="/login"
                  className="block hover:text-[#ff6f3c]"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setSupportOpen(!supportOpen)}
              className="flex justify-between items-center w-full text-gray-800 dark:text-gray-200"
            >
              Support <ChevronDown size={16} />
            </button>
            {supportOpen && (
              <div className="pl-4 mt-2 space-y-2">
                <Link to="/faq" className="block hover:text-[#ff6f3c]">
                  FAQ
                </Link>
                <Link to="/contact" className="block hover:text-[#ff6f3c]">
                  Contact Us
                </Link>
                <Link to="/live-chat" className="block hover:text-[#ff6f3c]">
                  Live Chat
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="flex items-center space-x-2 text-gray-800 dark:text-gray-200"
          >
            <LucideShoppingCart size={20} />
            <span>Cart (2)</span>
          </Link>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
