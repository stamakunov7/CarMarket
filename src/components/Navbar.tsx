import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onAuthClick: () => void;
  onNavClick: (page: 'main' | 'faq' | 'sell' | 'support') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthClick, onNavClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-[#1E1E1E] shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <span 
              onClick={() => onNavClick('main')}
              className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              CarMarket
            </span>
            <div className="hidden md:flex space-x-4">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick('main');
                }}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md"
              >
                Buy
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick('sell');
                }}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md"
              >
                Sell
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick('support');
                }}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md"
              >
                Support
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick('faq');
                }}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md"
              >
                FAQ
              </a>
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
            <button 
              onClick={onAuthClick}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Sign in / Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 