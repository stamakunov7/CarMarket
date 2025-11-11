import React, { useState, useEffect, useCallback } from 'react';
import { carData } from '../data/cars';
import { useListings } from '../hooks/useListings';
import { FiltersState, RangeValue } from '../constants/filters';

type FilterChangeHandler = <K extends keyof FiltersState>(filterType: K, value: FiltersState[K]) => void;

interface ApiFilterOptions {
  makes?: string[];
  models?: Record<string, string[]>;
  engine_sizes?: (number | string)[];
  transmission_types?: string[];
  drivetrain_types?: string[];
  fuel_types?: string[];
  body_types?: string[];
  conditions?: string[];
  customs_status?: string[];
  steering_wheel_positions?: string[];
  generations?: string[];
  colors?: string[];
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  min_mileage?: number;
  max_mileage?: number;
}

interface FilterOptions {
  makes: string[];
  models: Record<string, string[]>;
  engine_sizes: string[];
  transmission_types: string[];
  drivetrain_types: string[];
  fuel_types: string[];
  body_types: string[];
  conditions: string[];
  customs_status: string[];
  steering_wheel_positions: string[];
  generations: string[];
  colors: string[];
  min_year: number | null;
  max_year: number | null;
  min_price: number | null;
  max_price: number | null;
  min_mileage: number | null;
  max_mileage: number | null;
}

interface SidebarProps {
  filters: FiltersState;
  onFilterChange: FilterChangeHandler;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

type RangeFilterKey = 'priceRange' | 'mileage' | 'year';
type ArrayFilterKey =
  | 'engineSize'
  | 'transmission'
  | 'drivetrain'
  | 'fuelType'
  | 'bodyType'
  | 'condition'
  | 'customsStatus'
  | 'steeringWheel';

const FALLBACK_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Gold',
  'Purple',
  'Pink',
  'Beige',
  'Navy',
  'Maroon',
  'Turquoise',
];

const STATIC_GENERATION_GROUPS: Array<{ label: string; options: Array<{ value: string; label: string }> }> = [
  {
    label: 'BMW',
    options: [
      { value: 'G30', label: 'G30 (5 Series 2017-2023)' },
      { value: 'F30', label: 'F30 (3 Series 2012-2019)' },
      { value: 'E90', label: 'E90 (3 Series 2005-2012)' },
      { value: 'G20', label: 'G20 (3 Series 2019-present)' },
      { value: 'F10', label: 'F10 (5 Series 2010-2017)' },
      { value: 'E60', label: 'E60 (5 Series 2003-2010)' },
      { value: 'G01', label: 'G01 (X3 2017-present)' },
      { value: 'F25', label: 'F25 (X3 2010-2017)' },
      { value: 'G05', label: 'G05 (X5 2018-present)' },
      { value: 'F15', label: 'F15 (X5 2013-2018)' },
    ],
  },
  {
    label: 'Mercedes-Benz',
    options: [
      { value: 'W206', label: 'W206 (C-Class 2021-present)' },
      { value: 'W205', label: 'W205 (C-Class 2014-2021)' },
      { value: 'W204', label: 'W204 (C-Class 2007-2014)' },
      { value: 'W214', label: 'W214 (E-Class 2023-present)' },
      { value: 'W213', label: 'W213 (E-Class 2016-2023)' },
      { value: 'W212', label: 'W212 (E-Class 2009-2016)' },
      { value: 'X254', label: 'X254 (GLC 2022-present)' },
      { value: 'X253', label: 'X253 (GLC 2015-2022)' },
      { value: 'W167', label: 'W167 (GLE 2019-present)' },
      { value: 'W166', label: 'W166 (GLE 2011-2019)' },
    ],
  },
  {
    label: 'Audi',
    options: [
      { value: 'B10', label: 'B10 (A4 2023-present)' },
      { value: 'B9', label: 'B9 (A4 2015-2023)' },
      { value: 'B8', label: 'B8 (A4 2007-2015)' },
      { value: 'C8', label: 'C8 (A6 2018-present)' },
      { value: 'C7', label: 'C7 (A6 2011-2018)' },
      { value: 'FY', label: 'FY (Q5 2017-present)' },
      { value: '8R', label: '8R (Q5 2008-2017)' },
      { value: '4M', label: '4M (Q7 2015-present)' },
      { value: '4L', label: '4L (Q7 2005-2015)' },
    ],
  },
  {
    label: 'Toyota',
    options: [
      { value: 'XV80', label: 'XV80 (Camry 2023-present)' },
      { value: 'XV70', label: 'XV70 (Camry 2017-2023)' },
      { value: 'XV50', label: 'XV50 (Camry 2011-2017)' },
      { value: 'XV40', label: 'XV40 (Camry 2006-2011)' },
      { value: 'E210', label: 'E210 (Corolla 2018-present)' },
      { value: 'E170', label: 'E170 (Corolla 2013-2018)' },
      { value: 'E150', label: 'E150 (Corolla 2006-2013)' },
      { value: 'XW60', label: 'XW60 (Prius 2022-present)' },
      { value: 'XW50', label: 'XW50 (Prius 2015-2022)' },
      { value: 'XW30', label: 'XW30 (Prius 2009-2015)' },
      { value: 'XA50', label: 'XA50 (RAV4 2018-present)' },
      { value: 'XA40', label: 'XA40 (RAV4 2012-2018)' },
      { value: 'XA30', label: 'XA30 (RAV4 2005-2012)' },
    ],
  },
  {
    label: 'Honda',
    options: [
      { value: '11th Gen Civic', label: '11th Gen (Civic 2021-present)' },
      { value: '10th Gen Civic', label: '10th Gen (Civic 2015-2021)' },
      { value: '9th Gen Civic', label: '9th Gen (Civic 2011-2015)' },
      { value: '8th Gen Civic', label: '8th Gen (Civic 2005-2011)' },
      { value: '11th Gen Accord', label: '11th Gen (Accord 2022-present)' },
      { value: '10th Gen Accord', label: '10th Gen (Accord 2017-2022)' },
      { value: '9th Gen Accord', label: '9th Gen (Accord 2012-2017)' },
      { value: '8th Gen Accord', label: '8th Gen (Accord 2007-2012)' },
      { value: '6th Gen CR-V', label: '6th Gen (CR-V 2022-present)' },
      { value: '5th Gen CR-V', label: '5th Gen (CR-V 2016-2022)' },
      { value: '4th Gen CR-V', label: '4th Gen (CR-V 2011-2016)' },
      { value: '3rd Gen CR-V', label: '3rd Gen (CR-V 2006-2011)' },
    ],
  },
  {
    label: 'Porsche',
    options: [
      { value: '992', label: '992 (911 2018-present)' },
      { value: '991', label: '991 (911 2011-2019)' },
      { value: '997', label: '997 (911 2004-2012)' },
      { value: '718', label: '718 (Cayman 2016-present)' },
      { value: '981', label: '981 (Cayman 2012-2016)' },
      { value: '987', label: '987 (Cayman 2005-2012)' },
      { value: '95B', label: '95B (Macan 2014-present)' },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange, onClearFilters, onApplyFilters }) => {
  const { getFilterOptions } = useListings();
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    technical: false,
    condition: false,
    location: false,
  });

  const combineFilterOptions = useCallback((data: ApiFilterOptions): FilterOptions => {
    const staticMakes = Array.from(new Set(carData.map(car => car.make))).sort();
    const staticModels: Record<string, string[]> = {};
    carData.forEach(car => {
      staticModels[car.make] = car.models.map(model => model.name);
    });

    const apiMakes = data.makes ?? [];
    const allMakes = Array.from(new Set([...staticMakes, ...apiMakes])).sort();

    const allModels: Record<string, string[]> = { ...staticModels };
    if (data.models) {
      Object.entries(data.models).forEach(([make, models]) => {
        const currentModels = allModels[make] ?? [];
        allModels[make] = Array.from(new Set([...currentModels, ...models])).sort();
      });
    }

    return {
      makes: allMakes,
      models: allModels,
      engine_sizes: (data.engine_sizes ?? []).map(size => size.toString()),
      transmission_types: data.transmission_types ?? [],
      drivetrain_types: data.drivetrain_types ?? [],
      fuel_types: data.fuel_types ?? [],
      body_types: data.body_types ?? [],
      conditions: data.conditions ?? [],
      customs_status: data.customs_status ?? [],
      steering_wheel_positions: data.steering_wheel_positions ?? [],
      generations: data.generations ?? [],
      colors: data.colors ?? [],
      min_year: data.min_year ?? null,
      max_year: data.max_year ?? null,
      min_price: data.min_price ?? null,
      max_price: data.max_price ?? null,
      min_mileage: data.min_mileage ?? null,
      max_mileage: data.max_mileage ?? null,
    };
  }, []);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getFilterOptions();
      if (!data) {
        setFilterOptions(null);
        setLoadError('Unable to load filter options. Please try again.');
        return;
      }

      setFilterOptions(combineFilterOptions(data));
    } catch (error) {
      console.error('Error fetching filter options:', error);
      setFilterOptions(null);
      setLoadError('Unable to load filter options. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [combineFilterOptions, getFilterOptions]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMultiSelect = (filterType: ArrayFilterKey, value: string) => {
    const currentValues = filters[filterType] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];

    onFilterChange(filterType, nextValues);
  };

  const handleRangeChange = useCallback(
    (filterType: RangeFilterKey, index: 0 | 1, rawValue: string) => {
      const parsedValue = rawValue === '' ? null : Number(rawValue);
      if (rawValue !== '' && Number.isNaN(parsedValue)) {
        return;
      }

      const currentRange = filters[filterType] as RangeValue;
      const nextRange: RangeValue = [...currentRange];
      nextRange[index] = parsedValue;

      onFilterChange(filterType, nextRange);
    },
    [filters, onFilterChange]
  );

  const getActiveFiltersCount = () => {
    let count = 0;

    if (filters.make) count++;
    if (filters.model) count++;

    if (filters.priceRange.some(value => value !== null)) count++;
    if (filters.mileage.some(value => value !== null)) count++;
    if (filters.year.some(value => value !== null)) count++;

    if (filters.engineSize.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.drivetrain.length > 0) count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.bodyType.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.customsStatus.length > 0) count++;
    if (filters.steeringWheel.length > 0) count++;

    if (filters.color) count++;
    if (filters.generation) count++;

    return count;
  };

  const FilterSection = ({ title, section, children }: { title: string; section: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-3 md:pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white mb-3"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${expandedSections[section] ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expandedSections[section] && children}
    </div>
  );

  const MultiSelectFilter = ({
    title,
    options,
    selectedValues,
    filterType,
  }: {
    title: string;
    options: string[];
    selectedValues: string[];
    filterType: ArrayFilterKey;
  }) => {
    if (!options || options.length === 0) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</label>
          <div className="text-xs text-gray-500 dark:text-gray-400">No options available</div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</label>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {options.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleMultiSelect(filterType, option)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const RangeFilter = ({
    title,
    minValue,
    maxValue,
    minPlaceholder,
    maxPlaceholder,
    filterType,
    min,
    max,
  }: {
    title: string;
    minValue: number | null;
    maxValue: number | null;
    minPlaceholder: string;
    maxPlaceholder: string;
    filterType: RangeFilterKey;
    min?: number | null;
    max?: number | null;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={minPlaceholder}
          value={minValue ?? ''}
          min={min ?? undefined}
          max={max ?? undefined}
          onChange={event => handleRangeChange(filterType, 0, event.target.value)}
          className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
        <input
          type="number"
          placeholder={maxPlaceholder}
          value={maxValue ?? ''}
          min={min ?? undefined}
          max={max ?? undefined}
          onChange={event => handleRangeChange(filterType, 1, event.target.value)}
          className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-lg shadow-sm transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !filterOptions) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-lg shadow-sm transition-colors duration-200 space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <p>{loadError ?? 'Unable to load filter options. Please try again.'}</p>
        <button
          onClick={loadOptions}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const colorOptions = filterOptions.colors.length > 0 ? filterOptions.colors : FALLBACK_COLORS;
  const generationOptions = filterOptions.generations;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-3 md:p-6 rounded-lg shadow-sm transition-colors duration-200 max-h-screen md:max-h-none overflow-y-auto md:overflow-y-visible">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
        <div className="flex items-center gap-2">
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <FilterSection title="Basic Info" section="basic">
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Make</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
              value={filters.make ?? ''}
              onChange={event => {
                const selectedMake = event.target.value || null;
                onFilterChange('make', selectedMake);
                onFilterChange('model', null);
              }}
            >
              <option value="">All makes</option>
              {filterOptions.makes.map(make => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Model</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
              value={filters.model ?? ''}
              onChange={event => onFilterChange('model', event.target.value || null)}
              disabled={!filters.make}
            >
              <option value="">All models</option>
              {filters.make &&
                filterOptions.models[filters.make]?.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
            </select>
          </div>

          <RangeFilter
            title="Price Range ($)"
            minValue={filters.priceRange[0]}
            maxValue={filters.priceRange[1]}
            minPlaceholder="Min"
            maxPlaceholder="Max"
            filterType="priceRange"
            min={filterOptions.min_price}
            max={filterOptions.max_price}
          />

          <RangeFilter
            title="Year"
            minValue={filters.year[0]}
            maxValue={filters.year[1]}
            minPlaceholder="From"
            maxPlaceholder="To"
            filterType="year"
            min={filterOptions.min_year}
            max={filterOptions.max_year}
          />

          <RangeFilter
            title="Mileage (km)"
            minValue={filters.mileage[0]}
            maxValue={filters.mileage[1]}
            minPlaceholder="Min"
            maxPlaceholder="Max"
            filterType="mileage"
            min={filterOptions.min_mileage}
            max={filterOptions.max_mileage}
          />
        </FilterSection>

        <FilterSection title="Technical Specs" section="technical">
          <MultiSelectFilter
            title="Engine Size"
            options={filterOptions.engine_sizes}
            selectedValues={filters.engineSize}
            filterType="engineSize"
          />

          <MultiSelectFilter
            title="Transmission"
            options={filterOptions.transmission_types}
            selectedValues={filters.transmission}
            filterType="transmission"
          />

          <MultiSelectFilter
            title="Drivetrain"
            options={filterOptions.drivetrain_types}
            selectedValues={filters.drivetrain}
            filterType="drivetrain"
          />

          <MultiSelectFilter
            title="Fuel Type"
            options={filterOptions.fuel_types}
            selectedValues={filters.fuelType}
            filterType="fuelType"
          />

          <MultiSelectFilter
            title="Body Type"
            options={filterOptions.body_types}
            selectedValues={filters.bodyType}
            filterType="bodyType"
          />
        </FilterSection>

        <FilterSection title="Condition & Status" section="condition">
          <MultiSelectFilter
            title="Condition"
            options={filterOptions.conditions}
            selectedValues={filters.condition}
            filterType="condition"
          />

          <MultiSelectFilter
            title="Customs Status"
            options={filterOptions.customs_status}
            selectedValues={filters.customsStatus}
            filterType="customsStatus"
          />

          <MultiSelectFilter
            title="Steering Wheel"
            options={filterOptions.steering_wheel_positions}
            selectedValues={filters.steeringWheel}
            filterType="steeringWheel"
          />
        </FilterSection>

        <FilterSection title="Additional" section="location">
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Color</label>
            <select
              value={filters.color ?? ''}
              onChange={event => onFilterChange('color', event.target.value || null)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
            >
              <option value="">All colors</option>
              {colorOptions.map(color => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Generation</label>
            <select
              value={filters.generation ?? ''}
              onChange={event => onFilterChange('generation', event.target.value || null)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
            >
              <option value="">All generations</option>
              {generationOptions.length > 0 ? (
                generationOptions.map(generation => (
                  <option key={generation} value={generation}>
                    {generation}
                  </option>
                ))
              ) : (
                STATIC_GENERATION_GROUPS.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
          </div>
        </FilterSection>

        <button
          onClick={onApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 px-3 md:px-4 rounded-md transition-colors duration-200 font-medium text-xs md:text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

