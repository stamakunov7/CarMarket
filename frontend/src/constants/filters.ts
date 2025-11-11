export type RangeValue = [number | null, number | null];

export interface FiltersState {
  make: string | null;
  model: string | null;
  priceRange: RangeValue;
  mileage: RangeValue;
  year: RangeValue;
  engineSize: string[];
  transmission: string[];
  drivetrain: string[];
  fuelType: string[];
  bodyType: string[];
  condition: string[];
  customsStatus: string[];
  steeringWheel: string[];
  color: string | null;
  generation: string | null;
}

export const createDefaultFilters = (): FiltersState => ({
  make: null,
  model: null,
  priceRange: [null, null],
  mileage: [null, null],
  year: [null, null],
  engineSize: [],
  transmission: [],
  drivetrain: [],
  fuelType: [],
  bodyType: [],
  condition: [],
  customsStatus: [],
  steeringWheel: [],
  color: null,
  generation: null,
});

