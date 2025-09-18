import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisibleMobile, setIsSearchVisibleMobile] = useState(false); // New state for mobile search
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // For a potential user dropdown
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Example: Assume user is logged in for now, replace with actual auth state
  const isAuthenticated = false; // Set to true to see logged-in state

  const navigation = [
    { name: 'Cases', href: '/products?category=Cases' },
    { name: 'Straps', href: '/products?category=Straps' },
    { name: 'Power Banks', href: '/products?category=Power Banks' },
    { name: 'Cables', href: '/products?category=Cables' },
    { name: 'MagSafe', href: '/products?category=MagSafe' },
    { name: 'Charger', href: '/products?category=Charger' },
    { name: 'More', href: '/products' },
  ];

  const isActiveRoute = (href) => {
    // Check if the current path exactly matches or starts with the href for category pages
    const currentPath = location.pathname + location.search;
    return currentPath === href || currentPath.startsWith(`${href}&`) || (currentPath.startsWith('/products') && href.startsWith('/products') && currentPath.includes(new URLSearchParams(href.split('?')[1]).get('category')));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      // Close mobile search if open
      setIsSearchVisibleMobile(false);
      setIsMobileMenuOpen(false); // Also close mobile nav if search was triggered from it
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              {/* Replace with an actual SVG logo or image */}
              <img src="https://placehold.co/40x40/E5E7EB/4B5563/png" alt="Company Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-extrabold text-gray-900 tracking-tight">
                SwiftCart
              </span>
            </Link>
          </div>

          {/* Desktop Search (visible only on large screens) */}
          <div className="flex-grow max-w-lg mx-8 hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="block w-full py-2.5 pl-10 pr-3 border-0 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </form>
          </div>

          {/* Right Section - Icons & Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Icon - Mobile & Tablet */}
            <button
              onClick={() => setIsSearchVisibleMobile(!isSearchVisibleMobile)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Toggle Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center ring-2 ring-white">
                2
              </span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </Link>

            {/* Cart Total - Desktop */}
            <div className="hidden sm:block text-sm font-semibold text-gray-900 pl-2">
              $123.45 {/* Example total */}
            </div>

            {/* User Profile / Auth Links */}
            <div className="relative hidden sm:block" ref={userDropdownRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isUserDropdownOpen}
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                >
                  Login / Register
                </Link>
              )}

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* --- Secondary Header Row (Desktop Navigation) --- */}
        <div className="hidden lg:flex justify-center border-t border-gray-100 mt-0 pt-3 pb-3">
          <nav className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-sm font-medium transition-colors duration-200 py-1 group ${
                  isActiveRoute(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-bottom-left duration-300 ${
                    isActiveRoute(item.href) ? 'scale-x-100' : ''
                  }`}
                ></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* --- Mobile Search Input (toggles visibility) --- */}
        {isSearchVisibleMobile && (
          <div className="lg:hidden px-4 py-3 border-t border-gray-100">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="block w-full py-2.5 pl-10 pr-3 border-0 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </form>
          </div>
        )}

        {/* --- Mobile Menu Overlay --- */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        <div
          ref={mobileMenuRef}
          className={`fixed inset-y-0 right-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Close Mobile Menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-2">
            {isAuthenticated ? (
                 <>
                   <Link
                     to="/profile"
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="block px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                   >
                     My Profile
                   </Link>
                   <Link
                     to="/orders"
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="block px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                   >
                     My Orders
                   </Link>
                   <button
                     onClick={() => { /* Handle Logout */ setIsMobileMenuOpen(false); }}
                     className="block w-full text-left px-3 py-2 text-base font-medium rounded-md text-red-600 hover:bg-gray-50 transition-colors"
                   >
                     Logout
                   </button>
                   <div className="border-t border-gray-100 my-2"></div>
                 </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Login / Register
              </Link>
            )}

            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  isActiveRoute(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;