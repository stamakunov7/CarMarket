import React, { useState, useEffect, useCallback, useRef } from 'react';

interface FilterOptions {
  makes: string[];
  models: { [key: string]: string[] };
  engine_sizes: string[];
  transmission_types: string[];
  drivetrain_types: string[];
  fuel_types: string[];
  body_types: string[];
  conditions: string[];
  customs_status: string[];
  steering_wheel_positions: string[];
  min_year: number;
  max_year: number;
  min_price: number;
  max_price: number;
  min_mileage: number;
  max_mileage: number;
}

interface SidebarProps {
  filters: {
    make: string[];
    model: string[];
    priceRange: [number, number];
    mileage: [number, number];
    year: [number, number];
    engineSize: string[];
    transmission: string[];
    drivetrain: string[];
    fuelType: string[];
    bodyType: string[];
    condition: string[];
    customsStatus: string[];
    steeringWheel: string[];
    color: string[];
    generation: string[];
  };
  onFilterChange: (filterType: string, value: any) => void;
  onApplyFilters: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange, onApplyFilters }) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    technical: false,
    condition: false,
    location: false
  });
  const [colorInput, setColorInput] = useState<string>('');
  const [generationInput, setGenerationInput] = useState<string>('');
  const colorInputRef = useRef<HTMLInputElement>(null);
  const generationInputRef = useRef<HTMLInputElement>(null);

  // Handle color input change
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Color input changed:', value);
    setColorInput(value);
  }, []);

  // Handle generation input change
  const handleGenerationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Generation input changed:', value);
    setGenerationInput(value);
  }, []);

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log('Fetching filter options...');
        const response = await fetch('https://carmarket-production.up.railway.app/api/listings/filters/options');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Filter options data:', data);
        if (data.success) {
          setFilterOptions(data.data);
          console.log('Filter options set successfully');
        } else {
          console.error('API returned success: false', data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMultiSelect = (filterType: string, value: string) => {
    const currentValues = filters[filterType as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  const clearAllFilters = () => {
    onFilterChange('make', []);
    onFilterChange('model', []);
    onFilterChange('priceRange', [0, 0]);
    onFilterChange('mileage', [0, 0]);
    onFilterChange('year', [0, 0]);
    onFilterChange('engineSize', []);
    onFilterChange('transmission', []);
    onFilterChange('drivetrain', []);
    onFilterChange('fuelType', []);
    onFilterChange('bodyType', []);
    onFilterChange('condition', []);
    onFilterChange('customsStatus', []);
    onFilterChange('steeringWheel', []);
    onFilterChange('color', []);
    onFilterChange('generation', []);
    setColorInput('');
    setGenerationInput('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.make.length > 0) count++;
    if (filters.model.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] > 0) count++;
    if (filters.mileage[0] > 0 || filters.mileage[1] > 0) count++;
    if (filters.year[0] > 0 || filters.year[1] > 0) count++;
    if (filters.engineSize.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.drivetrain.length > 0) count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.bodyType.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.customsStatus.length > 0) count++;
    if (filters.steeringWheel.length > 0) count++;
    if (filters.color.length > 0) count++;
    if (filters.generation.length > 0) count++;
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
    filterType 
  }: { 
    title: string; 
    options: string[] | undefined; 
    selectedValues: string[]; 
    filterType: string; 
  }) => {
    // Safety check - if options is undefined or null, return empty div
    if (!options || !Array.isArray(options) || options.length === 0) {
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
          {options.map((option) => (
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
    min = 0,
    max = 1000000
  }: { 
    title: string; 
    minValue: number; 
    maxValue: number; 
    minPlaceholder: string; 
    maxPlaceholder: string; 
    filterType: string;
    min?: number;
    max?: number;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={minPlaceholder}
          value={minValue || ''}
          min={min}
          max={max}
          onChange={(e) => onFilterChange(filterType, [parseInt(e.target.value) || 0, maxValue])}
          className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
        <input
          type="number"
          placeholder={maxPlaceholder}
          value={maxValue || ''}
          min={min}
          max={max}
          onChange={(e) => onFilterChange(filterType, [minValue, parseInt(e.target.value) || 0])}
          className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>
    </div>
  );

  console.log('Sidebar render - filterOptions:', filterOptions);

  if (!filterOptions) {
    console.log('Filter options not loaded, showing loading state');
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
            onClick={clearAllFilters}
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
            value={filters.make[0] || ''}
              onChange={(e) => {
                onFilterChange('make', [e.target.value]);
                onFilterChange('model', []); // Clear model when make changes
              }}
          >
            <option value="">All makes</option>
              {filterOptions.makes.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
          </select>
        </div>

          <div className="mb-3 md:mb-4">
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Model</label>
          <select 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
            value={filters.model[0] || ''}
            onChange={(e) => onFilterChange('model', [e.target.value])}
              disabled={!filters.make[0]}
          >
            <option value="">All models</option>
              {filters.make[0] && filterOptions.models[filters.make[0]]?.map((model) => (
                <option key={model} value={model}>{model}</option>
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
            options={filterOptions?.engine_sizes}
            selectedValues={filters.engineSize}
            filterType="engineSize"
          />

          <MultiSelectFilter
            title="Transmission"
            options={filterOptions?.transmission_types}
            selectedValues={filters.transmission}
            filterType="transmission"
          />

          <MultiSelectFilter
            title="Drivetrain"
            options={filterOptions?.drivetrain_types}
            selectedValues={filters.drivetrain}
            filterType="drivetrain"
          />

          <MultiSelectFilter
            title="Fuel Type"
            options={filterOptions?.fuel_types}
            selectedValues={filters.fuelType}
            filterType="fuelType"
          />

          <MultiSelectFilter
            title="Body Type"
            options={filterOptions?.body_types}
            selectedValues={filters.bodyType}
            filterType="bodyType"
          />
        </FilterSection>

        <FilterSection title="Condition & Status" section="condition">
          <MultiSelectFilter
            title="Condition"
            options={filterOptions?.conditions}
            selectedValues={filters.condition}
            filterType="condition"
          />

          <MultiSelectFilter
            title="Customs Status"
            options={filterOptions?.customs_status}
            selectedValues={filters.customsStatus}
            filterType="customsStatus"
          />

          <MultiSelectFilter
            title="Steering Wheel"
            options={filterOptions?.steering_wheel_positions}
            selectedValues={filters.steeringWheel}
            filterType="steeringWheel"
          />
        </FilterSection>

        <FilterSection title="Additional" section="location">
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Color</label>
            <select
              value={colorInput}
              onChange={(e) => {
                console.log('Color selected:', e.target.value);
                setColorInput(e.target.value);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
            >
              <option value="">All colors</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Silver">Silver</option>
              <option value="Gray">Gray</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Brown">Brown</option>
              <option value="Gold">Gold</option>
              <option value="Purple">Purple</option>
              <option value="Pink">Pink</option>
              <option value="Beige">Beige</option>
              <option value="Navy">Navy</option>
              <option value="Maroon">Maroon</option>
              <option value="Turquoise">Turquoise</option>
            </select>
        </div>

          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Generation</label>
            <select
              value={generationInput}
              onChange={(e) => {
                console.log('Generation selected:', e.target.value);
                setGenerationInput(e.target.value);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 md:p-2 bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm md:text-base"
            >
              <option value="">All generations</option>
              <optgroup label="BMW">
                <option value="G30">G30 (5 Series 2017-2023)</option>
                <option value="F30">F30 (3 Series 2012-2019)</option>
                <option value="E90">E90 (3 Series 2005-2012)</option>
                <option value="G20">G20 (3 Series 2019-present)</option>
                <option value="F10">F10 (5 Series 2010-2017)</option>
                <option value="E60">E60 (5 Series 2003-2010)</option>
                <option value="G01">G01 (X3 2017-present)</option>
                <option value="F25">F25 (X3 2010-2017)</option>
                <option value="G05">G05 (X5 2018-present)</option>
                <option value="F15">F15 (X5 2013-2018)</option>
              </optgroup>
              <optgroup label="Mercedes-Benz">
                <option value="W206">W206 (C-Class 2021-present)</option>
                <option value="W205">W205 (C-Class 2014-2021)</option>
                <option value="W204">W204 (C-Class 2007-2014)</option>
                <option value="W214">W214 (E-Class 2023-present)</option>
                <option value="W213">W213 (E-Class 2016-2023)</option>
                <option value="W212">W212 (E-Class 2009-2016)</option>
                <option value="X254">X254 (GLC 2022-present)</option>
                <option value="X253">X253 (GLC 2015-2022)</option>
                <option value="W167">W167 (GLE 2019-present)</option>
                <option value="W166">W166 (GLE 2011-2019)</option>
              </optgroup>
              <optgroup label="Audi">
                <option value="B10">B10 (A4 2023-present)</option>
                <option value="B9">B9 (A4 2015-2023)</option>
                <option value="B8">B8 (A4 2007-2015)</option>
                <option value="C8">C8 (A6 2018-present)</option>
                <option value="C7">C7 (A6 2011-2018)</option>
                <option value="FY">FY (Q5 2017-present)</option>
                <option value="8R">8R (Q5 2008-2017)</option>
                <option value="4M">4M (Q7 2015-present)</option>
                <option value="4L">4L (Q7 2005-2015)</option>
              </optgroup>
              <optgroup label="Toyota">
                <option value="XV80">XV80 (Camry 2023-present)</option>
                <option value="XV70">XV70 (Camry 2017-2023)</option>
                <option value="XV50">XV50 (Camry 2011-2017)</option>
                <option value="XV40">XV40 (Camry 2006-2011)</option>
                <option value="E210">E210 (Corolla 2018-present)</option>
                <option value="E170">E170 (Corolla 2013-2018)</option>
                <option value="E150">E150 (Corolla 2006-2013)</option>
                <option value="XW60">XW60 (Prius 2022-present)</option>
                <option value="XW50">XW50 (Prius 2015-2022)</option>
                <option value="XW30">XW30 (Prius 2009-2015)</option>
                <option value="XA50">XA50 (RAV4 2018-present)</option>
                <option value="XA40">XA40 (RAV4 2012-2018)</option>
                <option value="XA30">XA30 (RAV4 2005-2012)</option>
              </optgroup>
              <optgroup label="Honda">
                <option value="11th Gen">11th Gen (Civic 2021-present)</option>
                <option value="10th Gen">10th Gen (Civic 2015-2021)</option>
                <option value="9th Gen">9th Gen (Civic 2011-2015)</option>
                <option value="8th Gen">8th Gen (Civic 2005-2011)</option>
                <option value="11th Gen">11th Gen (Accord 2022-present)</option>
                <option value="10th Gen">10th Gen (Accord 2017-2022)</option>
                <option value="9th Gen">9th Gen (Accord 2012-2017)</option>
                <option value="8th Gen">8th Gen (Accord 2007-2012)</option>
                <option value="6th Gen">6th Gen (CR-V 2022-present)</option>
                <option value="5th Gen">5th Gen (CR-V 2016-2022)</option>
                <option value="4th Gen">4th Gen (CR-V 2011-2016)</option>
                <option value="3rd Gen">3rd Gen (CR-V 2006-2011)</option>
              </optgroup>
              <optgroup label="Porsche">
                <option value="992">992 (911 2018-present)</option>
                <option value="991">991 (911 2011-2019)</option>
                <option value="997">997 (911 2004-2012)</option>
                <option value="718">718 (Cayman 2016-present)</option>
                <option value="981">981 (Cayman 2012-2016)</option>
                <option value="987">987 (Cayman 2005-2012)</option>
                <option value="95B">95B (Macan 2014-present)</option>
              </optgroup>
            </select>
          </div>
        </FilterSection>

        <button 
          onClick={() => {
            // Apply current input values to filters before applying
            onFilterChange('color', [colorInput]);
            onFilterChange('generation', [generationInput]);
            onApplyFilters();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 px-3 md:px-4 rounded-md transition-colors duration-200 font-medium text-xs md:text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 