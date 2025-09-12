import React, { useState } from 'react';

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

interface CarModalProps {
  car: Car;
  onClose: () => void;
}

const CarModal: React.FC<CarModalProps> = ({ car, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-[60]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-2">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg max-w-4xl w-full relative transition-colors duration-200">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1.5 hover:bg-opacity-75 transition-colors duration-200 z-[70]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image gallery */}
              <div className="relative h-[300px]">
                <img
                  src={car.images[currentImageIndex]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className={`w-full h-full object-cover cursor-zoom-in ${isZoomed ? 'object-contain' : ''}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                
                {/* Navigation arrows */}
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image counter */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded-full text-sm">
                  {currentImageIndex + 1} / {car.images.length}
                </div>
              </div>

              {/* Thumbnail gallery */}
              <div className="flex gap-1 p-2 overflow-x-auto bg-gray-100 dark:bg-[#121212]">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Car details */}
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {car.year} {car.make} {car.model}
              </h2>
              
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ${car.price.toLocaleString()}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-[#121212] p-2 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mileage</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.mileage.toLocaleString()} mi</div>
                </div>
                <div className="bg-gray-50 dark:bg-[#121212] p-2 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Engine</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.engine}</div>
                </div>
                <div className="bg-gray-50 dark:bg-[#121212] p-2 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Power</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{car.power} hp</div>
                </div>
              </div>

              <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{car.description}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-md transition-colors duration-200"
                >
                  Request Info
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-200 dark:bg-[#121212] text-gray-800 dark:text-white py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Schedule Test Drive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarModal; 