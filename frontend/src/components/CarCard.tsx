import React from 'react';

interface CarCardProps {
  car: {
    id: number;
    year: number;
    manufacturer: string;
    model: string;
    engine: string;
    drivetrain: string;
    price: number;
    location: string;
    primary_image?: string;
    mileage?: number;
    description?: string;
    title?: string;
    engine_volume?: string | number;
    engine_power?: number;
  };
  onClick: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const truncateLocation = (location: string, maxLength: number = 20): string => {
    if (!location) return 'N/A';
    if (location.length <= maxLength) return location;
    return location.substring(0, maxLength) + '...';
  };

  const formatMileage = (mileage: number): string => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const formatEngine = (): string => {
    // If we have both engine_volume and engine_power with valid values, format as "3.5L 300hp"
    if (car.engine_volume && car.engine_power && 
        car.engine_volume !== '0.0' && car.engine_volume !== 0 && 
        car.engine_power !== 0) {
      const volume = typeof car.engine_volume === 'string' ? car.engine_volume : car.engine_volume.toString();
      return `${volume}L ${car.engine_power}hp`;
    }
    // Fallback to engine description if available
    return car.engine || 'N/A';
  };

  const displayTitle = car.title || `${car.year} ${car.manufacturer} ${car.model}`;

  return (
    <div
      className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {car.primary_image ? (
          <img
            src={car.primary_image}
            alt={`${car.year} ${car.manufacturer} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name: Use title if available, otherwise fallback to Year Manufacturer Model */}
        <h2
          className="text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate whitespace-nowrap overflow-hidden"
          title={displayTitle}
        >
          {displayTitle}
        </h2>

        {/* Car Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Engine */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Engine</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatEngine()}
            </p>
          </div>

          {/* Drivetrain */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Drivetrain</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {car.drivetrain || 'N/A'}
            </p>
          </div>

          {/* Mileage (if available) */}
          {car.mileage && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mileage</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatMileage(car.mileage)} mi
              </p>
            </div>
          )}

          {/* Location */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
            <p className="font-semibold text-gray-900 dark:text-white truncate whitespace-nowrap overflow-hidden" title={car.location || 'N/A'}>
              {truncateLocation(car.location || 'N/A')}
            </p>
          </div>
        </div>

        {/* Price Button */}
        <button 
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            // Handle price click - could show contact info or trigger inquiry
            console.log('Price clicked for car:', car.id);
          }}
        >
          {formatPrice(car.price)}
        </button>
      </div>
    </div>
  );
};

export default CarCard;
