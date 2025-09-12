import React, { useState } from 'react';
import CarModal from './CarModal';
import AppliedFilters from './AppliedFilters';

interface Car {
  id: number;
  year: number;
  make: string;
  model: string;
  mileage: number;
  price: number;
  image: string;
  power: number;
  engine: string;
  description: string;
  images: string[];
}

interface CarListProps {
  filters: {
    make: string[];
    model: string[];
    priceRange: [number, number];
    mileage: [number, number];
    year: [number, number];
  };
  onFilterChange: (filterType: string, value: any) => void;
}

const CarList: React.FC<CarListProps> = ({ filters, onFilterChange }) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');

  const cars: Car[] = [
    {
      id: 1,
      year: 2020,
      make: "Toyota",
      model: "Camry",
      mileage: 35000,
      price: 25999,
      power: 203,
      engine: "2.5L 4-cylinder",
      image: "https://placehold.co/600x400",
      description: "Well-maintained Toyota Camry with excellent fuel efficiency.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 2,
      year: 2019,
      make: "Honda",
      model: "Accord",
      mileage: 15000,
      price: 23500,
      power: 192,
      engine: "1.5L Turbo",
      image: "https://placehold.co/600x400",
      description: "Low mileage Honda Accord in pristine condition.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 3,
      year: 2021,
      make: "Ford",
      model: "Mustang",
      mileage: 15000,
      price: 35999,
      power: 310,
      engine: "2.3L EcoBoost",
      image: "https://placehold.co/600x400",
      description: "Powerful Ford Mustang with premium features.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 4,
      year: 2022,
      make: "Toyota",
      model: "Corolla",
      mileage: 25000,
      price: 22000,
      power: 169,
      engine: "2.0L 4-cylinder",
      image: "https://placehold.co/600x400",
      description: "Reliable Toyota Corolla with great fuel economy.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 5,
      year: 2023,
      make: "Honda",
      model: "Civic",
      mileage: 12000,
      price: 24500,
      power: 158,
      engine: "2.0L 4-cylinder",
      image: "https://placehold.co/600x400",
      description: "Sporty Honda Civic with modern features.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 6,
      year: 2021,
      make: "Ford",
      model: "F-150",
      mileage: 45000,
      price: 42000,
      power: 290,
      engine: "3.3L V6",
      image: "https://placehold.co/600x400",
      description: "Powerful Ford F-150 pickup truck.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 7,
      year: 2024,
      make: "Mercedes",
      model: "GLE",
      mileage: 8000,
      price: 65000,
      power: 362,
      engine: "3.0L Inline-6 Turbo",
      image: "https://placehold.co/600x400",
      description: "Luxurious Mercedes GLE with premium features.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    },
    {
      id: 8,
      year: 2023,
      make: "BMW",
      model: "X5",
      mileage: 18000,
      price: 58000,
      power: 335,
      engine: "3.0L Inline-6 Turbo",
      image: "https://placehold.co/600x400",
      description: "Sporty BMW X5 with advanced technology.",
      images: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"]
    }
  ];

  // Filtering function
  const filterCars = (cars: Car[], filters: any): Car[] => {
    return cars.filter(car => {
      // Make filter
      if (filters.make[0] && filters.make[0] !== '') {
        if (car.make.toLowerCase() !== filters.make[0].toLowerCase()) {
          return false;
        }
      }

      // Model filter
      if (filters.model[0] && filters.model[0] !== '') {
        if (car.model.toLowerCase() !== filters.model[0].toLowerCase()) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange[0] > 0 && car.price < filters.priceRange[0]) {
        return false;
      }
      if (filters.priceRange[1] > 0 && car.price > filters.priceRange[1]) {
        return false;
      }

      // Mileage filter
      if (filters.mileage[0] > 0 && car.mileage < filters.mileage[0]) {
        return false;
      }
      if (filters.mileage[1] > 0 && car.mileage > filters.mileage[1]) {
        return false;
      }

      // Year filter
      if (filters.year[0] > 0 && car.year < filters.year[0]) {
        return false;
      }
      if (filters.year[1] > 0 && car.year > filters.year[1]) {
        return false;
      }

      return true;
    });
  };

  // Sorting function
  const sortCars = (cars: Car[], sortOption: string): Car[] => {
    const sortedCars = [...cars];
    
    switch (sortOption) {
      case 'price-low':
        return sortedCars.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sortedCars.sort((a, b) => b.price - a.price);
      case 'mileage':
        return sortedCars.sort((a, b) => a.mileage - b.mileage);
      case 'year':
        return sortedCars.sort((a, b) => b.year - a.year);
      case 'relevance':
      default:
        return sortedCars; // Keep original order
    }
  };

  // Filter removal function
  const handleRemoveFilter = (filterType: string, value?: any) => {
    if (filterType === 'all') {
      // Clear all filters
      onFilterChange('make', ['']);
      onFilterChange('model', ['']);
      onFilterChange('priceRange', [0, 0]);
      onFilterChange('mileage', [0, 0]);
      onFilterChange('year', [0, 0]);
    } else {
      // Clear specific filter
      switch (filterType) {
        case 'make':
          onFilterChange('make', ['']);
          onFilterChange('model', ['']); // Also clear model when make is cleared
          break;
        case 'model':
          onFilterChange('model', ['']);
          break;
        case 'priceRange':
          onFilterChange('priceRange', [0, 0]);
          break;
        case 'mileage':
          onFilterChange('mileage', [0, 0]);
          break;
        case 'year':
          onFilterChange('year', [0, 0]);
          break;
      }
    }
  };

  const filteredCars = filterCars(cars, filters);
  const sortedCars = sortCars(filteredCars, sortBy);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Available Cars ({sortedCars.length})
          </h1>
          <AppliedFilters 
            filters={filters} 
            onRemoveFilter={handleRemoveFilter} 
          />
        </div>
        <select 
          className="bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 ml-4"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="relevance">Sort by: Relevance</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="mileage">Mileage: Low to High</option>
          <option value="year">Year: Newest First</option>
        </select>
      </div>

      {sortedCars.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCars.map((car) => (
          <div
            key={car.id}
            className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedCar(car)}
          >
            <img
              src={car.image}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {car.year} {car.make} {car.model}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mileage</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{car.mileage.toLocaleString()} mi</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engine</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{car.engine}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Power</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{car.power} hp</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${car.price.toLocaleString()}</p>
                </div>
              </div>
              <button 
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  // Handle request info logic here
                }}
              >
                Request Info
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {selectedCar && (
        <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
};

export default CarList; 