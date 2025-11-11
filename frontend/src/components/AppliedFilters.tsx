import React, { useMemo } from 'react';
import { FiltersState } from '../constants/filters';

interface AppliedFiltersProps {
  filters: FiltersState;
  onRemoveFilter: (filterType: string, value?: any) => void;
}

interface ActiveFilter {
  type: string;
  label: string;
  value?: any;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const AppliedFilters: React.FC<AppliedFiltersProps> = ({ filters, onRemoveFilter }) => {
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const items: ActiveFilter[] = [];

    if (filters.make) {
      items.push({
        type: 'make',
        label: `Make: ${capitalize(filters.make)}`,
        value: filters.make,
      });
    }

    if (filters.model) {
      items.push({
        type: 'model',
        label: `Model: ${capitalize(filters.model)}`,
        value: filters.model,
      });
    }

    const [minPrice, maxPrice] = filters.priceRange;
    if (minPrice !== null || maxPrice !== null) {
      const minLabel = minPrice !== null ? `$${minPrice.toLocaleString()}` : 'Any';
      const maxLabel = maxPrice !== null ? `$${maxPrice.toLocaleString()}` : 'Any';
      items.push({
        type: 'priceRange',
        label: `Price: ${minLabel} - ${maxLabel}`,
      });
    }

    const [minMileage, maxMileage] = filters.mileage;
    if (minMileage !== null || maxMileage !== null) {
      const minLabel = minMileage !== null ? `${minMileage.toLocaleString()} km` : 'Any';
      const maxLabel = maxMileage !== null ? `${maxMileage.toLocaleString()} km` : 'Any';
      items.push({
        type: 'mileage',
        label: `Mileage: ${minLabel} - ${maxLabel}`,
      });
    }

    const [minYear, maxYear] = filters.year;
    if (minYear !== null || maxYear !== null) {
      const minLabel = minYear !== null ? minYear.toString() : 'Any';
      const maxLabel = maxYear !== null ? maxYear.toString() : 'Any';
      items.push({
        type: 'year',
        label: `Year: ${minLabel} - ${maxLabel}`,
      });
    }

    filters.engineSize.forEach(size => {
      items.push({
        type: 'engineSize',
        label: `Engine Size: ${size}`,
        value: size,
      });
    });

    filters.transmission.forEach(transmission => {
      items.push({
        type: 'transmission',
        label: `Transmission: ${transmission}`,
        value: transmission,
      });
    });

    filters.drivetrain.forEach(drivetrain => {
      items.push({
        type: 'drivetrain',
        label: `Drivetrain: ${drivetrain}`,
        value: drivetrain,
      });
    });

    filters.fuelType.forEach(fuel => {
      items.push({
        type: 'fuelType',
        label: `Fuel: ${fuel}`,
        value: fuel,
      });
    });

    filters.bodyType.forEach(body => {
      items.push({
        type: 'bodyType',
        label: `Body: ${body}`,
        value: body,
      });
    });

    filters.condition.forEach(condition => {
      items.push({
        type: 'condition',
        label: `Condition: ${condition}`,
        value: condition,
      });
    });

    filters.customsStatus.forEach(status => {
      items.push({
        type: 'customsStatus',
        label: `Customs: ${status}`,
        value: status,
      });
    });

    filters.steeringWheel.forEach(position => {
      items.push({
        type: 'steeringWheel',
        label: `Steering: ${position}`,
        value: position,
      });
    });

    if (filters.color) {
      items.push({
        type: 'color',
        label: `Color: ${filters.color}`,
        value: filters.color,
      });
    }

    if (filters.generation) {
      items.push({
        type: 'generation',
        label: `Generation: ${filters.generation}`,
        value: filters.generation,
      });
    }

    return items;
  }, [filters]);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Applied filters:</span>
      {activeFilters.map((filter, index) => (
        <div
          key={`${filter.type}-${filter.value ?? index}`}
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
