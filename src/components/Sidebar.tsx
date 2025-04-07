import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Sidebar: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-lg shadow-sm transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Filters</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Make</label>
          <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
            <option value="">All makes</option>
            <option value="toyota">Toyota</option>
            <option value="honda">Honda</option>
            <option value="ford">Ford</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
          <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
            <option value="">All models</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" />
            <input type="number" placeholder="Max" className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mileage</label>
          <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
            <option value="">Any mileage</option>
            <option value="0-30000">Under 30,000</option>
            <option value="30000-60000">30,000 - 60,000</option>
            <option value="60000-90000">60,000 - 90,000</option>
            <option value="90000+">Over 90,000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
          <div className="flex gap-2">
            <select className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
              <option value="">From</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
              <option value="">To</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-200">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 