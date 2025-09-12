import React from 'react';

interface AppliedFiltersProps {
  filters: {
    make: string[];
    model: string[];
    priceRange: [number, number];
    mileage: [number, number];
    year: [number, number];
  };
  onRemoveFilter: (filterType: string, value?: any) => void;
}

const AppliedFilters: React.FC<AppliedFiltersProps> = ({ filters, onRemoveFilter }) => {
  const getActiveFilters = () => {
    const activeFilters: Array<{ type: string; label: string; value: any }> = [];

    // Make filter
    if (filters.make[0] && filters.make[0] !== '') {
      activeFilters.push({
        type: 'make',
        label: `Make: ${filters.make[0].charAt(0).toUpperCase() + filters.make[0].slice(1)}`,
        value: filters.make[0]
      });
    }

    // Model filter
    if (filters.model[0] && filters.model[0] !== '') {
      activeFilters.push({
        type: 'model',
        label: `Model: ${filters.model[0].charAt(0).toUpperCase() + filters.model[0].slice(1)}`,
        value: filters.model[0]
      });
    }

    // Price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] > 0) {
      const minPrice = filters.priceRange[0] > 0 ? `$${filters.priceRange[0].toLocaleString()}` : 'Any';
      const maxPrice = filters.priceRange[1] > 0 ? `$${filters.priceRange[1].toLocaleString()}` : 'Any';
      activeFilters.push({
        type: 'priceRange',
        label: `Price: ${minPrice} - ${maxPrice}`,
        value: filters.priceRange
      });
    }

    // Mileage filter
    if (filters.mileage[0] > 0 || filters.mileage[1] > 0) {
      const minMileage = filters.mileage[0] > 0 ? `${filters.mileage[0].toLocaleString()} mi` : 'Any';
      const maxMileage = filters.mileage[1] > 0 ? `${filters.mileage[1].toLocaleString()} mi` : 'Any';
      activeFilters.push({
        type: 'mileage',
        label: `Mileage: ${minMileage} - ${maxMileage}`,
        value: filters.mileage
      });
    }

    // Year filter
    if (filters.year[0] > 0 || filters.year[1] > 0) {
      const minYear = filters.year[0] > 0 ? filters.year[0].toString() : 'Any';
      const maxYear = filters.year[1] > 0 ? filters.year[1].toString() : 'Any';
      activeFilters.push({
        type: 'year',
        label: `Year: ${minYear} - ${maxYear}`,
        value: filters.year
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Applied filters:</span>
      {activeFilters.map((filter, index) => (
        <div
          key={`${filter.type}-${index}`}
          className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors duration-200"
            aria-label={`Remove ${filter.label} filter`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => onRemoveFilter('all')}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline transition-colors duration-200"
      >
        Clear all
      </button>
    </div>
  );
};

export default AppliedFilters;
