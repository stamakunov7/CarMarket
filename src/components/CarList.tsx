import React, { useState } from 'react';
import CarModal from './CarModal';

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

const CarList: React.FC = () => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

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
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Cars</h1>
        <select className="bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5">
          <option value="relevance">Sort by: Relevance</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="mileage">Mileage: Low to High</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
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

      {selectedCar && (
        <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
};

export default CarList; 