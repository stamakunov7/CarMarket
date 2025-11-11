import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CarCard from './CarCard';
import AppliedFilters from './AppliedFilters';
import { useListings, Listing } from '../hooks/useListings';
import { FiltersState } from '../constants/filters';

type FilterChangeHandler = <K extends keyof FiltersState>(filterType: K, value: FiltersState[K]) => void;

interface CarListProps {
  filters: FiltersState;
  onFilterChange: FilterChangeHandler;
  onResetFilters: () => void;
  refreshTrigger?: number;
}

const CarList: React.FC<CarListProps> = ({ filters, onFilterChange, onResetFilters, refreshTrigger }) => {
  const { getListings, loading, error } = useListings();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [listings, setListings] = useState<Listing[]>([]);

  // Fetch listings from API
  const fetchListings = useCallback(async () => {
    const result = await getListings({
      make: filters.make || undefined,
      model: filters.model || undefined,
      minPrice: filters.priceRange[0] ?? undefined,
      maxPrice: filters.priceRange[1] ?? undefined,
      minYear: filters.year[0] ?? undefined,
      maxYear: filters.year[1] ?? undefined,
      minMileage: filters.mileage[0] ?? undefined,
      maxMileage: filters.mileage[1] ?? undefined,
      engineSize: filters.engineSize.length > 0 ? filters.engineSize : undefined,
      transmission: filters.transmission.length > 0 ? filters.transmission : undefined,
      drivetrain: filters.drivetrain.length > 0 ? filters.drivetrain : undefined,
      fuelType: filters.fuelType.length > 0 ? filters.fuelType : undefined,
      bodyType: filters.bodyType.length > 0 ? filters.bodyType : undefined,
      condition: filters.condition.length > 0 ? filters.condition : undefined,
      customsStatus: filters.customsStatus.length > 0 ? filters.customsStatus : undefined,
      steeringWheel: filters.steeringWheel.length > 0 ? filters.steeringWheel : undefined,
      color: filters.color ? [filters.color] : undefined,
      generation: filters.generation ? [filters.generation] : undefined,
      sortBy,
      sortOrder,
    });

    if (result) {
      setListings(result.listings);
    }
  }, [filters, getListings, sortBy, sortOrder]);

  // Load listings on component mount and when filters or sorting change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Refresh data when refreshTrigger changes (when returning to main page)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchListings();
    }
  }, [fetchListings, refreshTrigger]);

  // Refresh data when user returns to the page (focus event)
  useEffect(() => {
    const handleFocus = () => {
      fetchListings();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchListings]);


  // Filter removal function
  const handleRemoveFilter = (filterType: string, value?: any) => {
    if (filterType === 'all') {
      onResetFilters();
    } else {
      // Clear specific filter
      switch (filterType) {
        case 'make':
          onFilterChange('make', null);
          onFilterChange('model', null); // Also clear model when make is cleared
          break;
        case 'model':
          onFilterChange('model', null);
          break;
        case 'priceRange':
          onFilterChange('priceRange', [null, null]);
          break;
        case 'mileage':
          onFilterChange('mileage', [null, null]);
          break;
        case 'year':
          onFilterChange('year', [null, null]);
          break;
        case 'engineSize':
          onFilterChange(
            'engineSize',
            value ? filters.engineSize.filter(item => item !== value) : []
          );
          break;
        case 'transmission':
          onFilterChange(
            'transmission',
            value ? filters.transmission.filter(item => item !== value) : []
          );
          break;
        case 'drivetrain':
          onFilterChange(
            'drivetrain',
            value ? filters.drivetrain.filter(item => item !== value) : []
          );
          break;
        case 'fuelType':
          onFilterChange(
            'fuelType',
            value ? filters.fuelType.filter(item => item !== value) : []
          );
          break;
        case 'bodyType':
          onFilterChange(
            'bodyType',
            value ? filters.bodyType.filter(item => item !== value) : []
          );
          break;
        case 'condition':
          onFilterChange(
            'condition',
            value ? filters.condition.filter(item => item !== value) : []
          );
          break;
        case 'customsStatus':
          onFilterChange(
            'customsStatus',
            value ? filters.customsStatus.filter(item => item !== value) : []
          );
          break;
        case 'steeringWheel':
          onFilterChange(
            'steeringWheel',
            value ? filters.steeringWheel.filter(item => item !== value) : []
          );
          break;
        case 'color':
          onFilterChange('color', null);
          break;
        case 'generation':
          onFilterChange('generation', null);
          break;
      }
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex-1">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Available Cars ({listings.length})
          </h1>
          <AppliedFilters 
            filters={filters} 
            onRemoveFilter={handleRemoveFilter} 
          />
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-3">
          <button
            onClick={fetchListings}
            className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 items-center space-x-2"
            title="Refresh listings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <select 
            className="bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 md:p-2.5 w-full md:w-auto text-sm md:text-base"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="created_at-desc">Sort by: Newest First</option>
            <option value="created_at-asc">Sort by: Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="mileage-asc">Mileage: Low to High</option>
            <option value="mileage-desc">Mileage: High to Low</option>
            <option value="year-desc">Year: Newest First</option>
            <option value="year-asc">Year: Oldest First</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Loading cars...
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 text-lg mb-2">
            Error loading cars: {error}
          </div>
          <button
            onClick={fetchListings}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
          >
            Try again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No cars found matching your filters
          </div>
          <button
            onClick={() => handleRemoveFilter('all')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {listings.map((listing) => (
            <CarCard
              key={listing.id}
              car={{
                id: listing.id,
                year: listing.year,
                manufacturer: listing.manufacturer || listing.make,
                model: listing.model,
                engine: listing.engine || '',
                drivetrain: listing.drivetrain || '',
                price: listing.price,
                location: listing.location || '',
                primary_image: listing.primary_image,
                mileage: listing.mileage,
                description: listing.description,
                engine_volume: listing.engine_volume,
                engine_power: listing.engine_power
              }}
              onClick={() => navigate(`/cars/${listing.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default CarList; 