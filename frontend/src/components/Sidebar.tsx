import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  filters: {
    make: string[];
    model: string[];
    priceRange: [number, number];
    mileage: [number, number];
    year: [number, number];
  };
  onFilterChange: (filterType: string, value: any) => void;
  onApplyFilters: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange, onApplyFilters }) => {
  const { theme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-lg shadow-sm transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Filters</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Make</label>
          <select 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            value={filters.make[0] || ''}
            onChange={(e) => onFilterChange('make', [e.target.value])}
          >
            <option value="">All makes</option>
            <option value="toyota">Toyota</option>
            <option value="honda">Honda</option>
            <option value="ford">Ford</option>
            <option value="mercedes">Mercedes</option>
            <option value="bmw">BMW</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
          <select 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            value={filters.model[0] || ''}
            onChange={(e) => onFilterChange('model', [e.target.value])}
          >
            <option value="">All models</option>
            {filters.make[0] === 'toyota' && (
              <>
                <option value="camry">Camry</option>
                <option value="corolla">Corolla</option>
                <option value="rav4">RAV4</option>
              </>
            )}
            {filters.make[0] === 'honda' && (
              <>
                <option value="civic">Civic</option>
                <option value="accord">Accord</option>
                <option value="cr-v">CR-V</option>
              </>
            )}
            {filters.make[0] === 'ford' && (
              <>
                <option value="mustang">Mustang</option>
                <option value="f-150">F-150</option>
                <option value="explorer">Explorer</option>
              </>
            )}
            {filters.make[0] === 'mercedes' && (
              <>
                <option value="gle">GLE</option>
                <option value="c-class">C-Class</option>
                <option value="e-class">E-Class</option>
              </>
            )}
            {filters.make[0] === 'bmw' && (
              <>
                <option value="x5">X5</option>
                <option value="3-series">3 Series</option>
                <option value="5-series">5 Series</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.priceRange[0] || ''}
              onChange={(e) => onFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
              className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
            />
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.priceRange[1] || ''}
              onChange={(e) => onFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 0])}
              className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mileage</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.mileage[0] || ''}
              onChange={(e) => onFilterChange('mileage', [parseInt(e.target.value) || 0, filters.mileage[1]])}
              className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
            />
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.mileage[1] || ''}
              onChange={(e) => onFilterChange('mileage', [filters.mileage[0], parseInt(e.target.value) || 0])}
              className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="From" 
              value={filters.year[0] || ''}
              onChange={(e) => onFilterChange('year', [parseInt(e.target.value) || 0, filters.year[1]])}
              className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
            />
            <input 
              type="number" 
              placeholder="To" 
              value={filters.year[1] || ''}
              onChange={(e) => onFilterChange('year', [filters.year[0], parseInt(e.target.value) || 0])}
              className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
            />
          </div>
        </div>

        <button 
          onClick={onApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 