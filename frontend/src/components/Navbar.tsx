import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMobileMenu]);

  return (
    <nav className="bg-white dark:bg-[#1E1E1E] shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Mobile Burger Menu Button - Left side */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden mobile-menu-button p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Logo */}
            <Link 
              to="/"
              className="hidden md:block text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              CarMarket
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link 
                to="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                Buy
              </Link>
              <Link 
                to="/sell"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                Sell
              </Link>
              <Link 
                to="/support"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                Support
              </Link>
              <Link 
                to="/faq"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                FAQ
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full"
            >
              {theme === 'dark' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <span>{user.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E1E] rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                data-auth-trigger
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Sign in / Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden mobile-menu absolute top-16 left-0 right-0 bg-white dark:bg-[#1E1E1E] shadow-lg border-t border-gray-200 dark:border-gray-700 z-40">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Logo in Menu */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
              <Link 
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                CarMarket
              </Link>
            </div>
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              Buy
            </Link>
            <Link
              to="/sell"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              Sell
            </Link>
            <Link
              to="/support"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              Support
            </Link>
            <Link
              to="/faq"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              FAQ
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onAuthClick();
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                >
                  Sign in / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 