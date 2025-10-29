import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface CarDetails {
  id: number;
  title: string;
  description: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  manufacturer?: string;
  engine?: string;
  drivetrain?: string;
  location?: string;
  owner_phone?: string;
  generation?: string;
  body_type?: string;
  color?: string;
  fuel_type?: string;
  engine_volume?: number;
  engine_power?: number;
  transmission?: string;
  steering_wheel?: string;
  condition?: string;
  customs?: string;
  region?: string;
  registration?: string;
  exchange_possible?: boolean;
  availability?: boolean;
  contact_person?: string;
  tags?: string;
  equipment?: string;
  service_history?: string;
  owners_count?: number;
  vin?: string;
  registration_number?: string;
  images?: Array<{
    id: number;
    image_url: string;
    is_primary: boolean;
    image_order: number;
  }>;
  seller_username?: string;
  created_at: string;
}

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://carmarket-production.up.railway.app/api/listings/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setCar(data.data.listing);
        } else {
          setError(data.message || 'Car not found');
        }
      } catch (err) {
        setError('Failed to fetch car details');
        console.error('Error fetching car details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Car not found'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => navigate('/')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{car.year} {car.manufacturer || car.make} {car.model}</span>
          </div>
        </nav>
      </div>

      {/* Main content wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

            {/* LEFT: Gallery + basic header */}
            <section className="lg:col-span-2">
              <div className="flex flex-col gap-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                      {car.year} {car.manufacturer || car.make} {car.model}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {car.engine_volume && `${car.engine_volume}L`} {car.engine_power && `${car.engine_power} hp`} · {car.drivetrain} · {car.mileage.toLocaleString()} mi
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(car.price)}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {car.availability ? 'Available' : 'Unavailable'} · {car.location || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative rounded-lg overflow-hidden" style={{ maxHeight: '520px' }}>
                    {car.images && car.images.length > 0 ? (
                      <>
                        <img
                          src={car.images[selectedImageIndex]?.image_url}
                          alt={`${car.year} ${car.manufacturer || car.make} ${car.model}`}
                          className="w-full h-96 object-cover"
                        />
                        
                        {/* Image counter */}
                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {selectedImageIndex + 1} / {car.images.length}
                        </div>

                        {/* Navigation arrows */}
                        {car.images.length > 1 && (
                          <>
                            {/* Left arrow */}
                            <button
                              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                              disabled={selectedImageIndex === 0}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            {/* Right arrow */}
                            <button
                              onClick={() => setSelectedImageIndex(Math.min((car.images?.length || 1) - 1, selectedImageIndex + 1))}
                              disabled={selectedImageIndex === (car.images?.length || 1) - 1}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">No images</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {car.images && car.images.length > 1 && (
                    <div className="mt-4">
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {car.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              selectedImageIndex === index
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <img
                              src={image.image_url}
                              alt={`${car.year} ${car.manufacturer || car.make} ${car.model} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Labels / Tags */}
                <div className="flex items-center gap-3 flex-wrap">
                  {car.tags && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs dark:bg-red-900/30 dark:text-red-400">
                      {car.tags}
                    </span>
                  )}
                  {car.condition === 'Excellent' && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs dark:bg-yellow-900/30 dark:text-yellow-400">
                      VIP
                    </span>
                  )}
                  {car.availability && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-400">
                      Available
                    </span>
                  )}
                </div>

                {/* Specs grid */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Basic Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Make</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.manufacturer || car.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Model</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Year</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Generation</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.generation || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Body Type</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.body_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Color</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.color || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Mileage</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.mileage.toLocaleString()} mi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fuel Type</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.fuel_type || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Engine Volume</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.engine_volume ? `${car.engine_volume}L` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Power</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.engine_power ? `${car.engine_power} hp` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transmission</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.transmission || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Drivetrain</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.drivetrain || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Steering Wheel</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.steering_wheel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Condition</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.condition || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Customs</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.customs || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Region</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.region || car.location || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Registration</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.registration || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Exchange</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.exchange_possible ? 'Possible' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Availability</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.availability ? 'Available' : 'Unavailable'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Owners</span>
                      <span className="font-medium text-gray-900 dark:text-white">{car.owners_count || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {car.description || 'No description provided.'}
                  </p>
                </div>

              </div>
            </section>

            {/* RIGHT: Seller card + actions */}
            <aside className="space-y-4">
              <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Seller</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{car.contact_person || car.seller_username || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      {user ? (
                        car.owner_phone ? (
                          <a href={`tel:${car.owner_phone}`}>{car.owner_phone}</a>
                        ) : (
                          'N/A'
                        )
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Sign in to view</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {user ? (
                    car.owner_phone ? (
                      <>
                        <a
                          href={`tel:${car.owner_phone}`}
                          className="block text-center py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                        >
                          Call
                        </a>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://wa.me/${car.owner_phone.replace(/[^0-9]/g, '')}`}
                          className="block text-center py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                        >
                          WhatsApp
                        </a>
                      </>
                    ) : (
                      <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No phone number available
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        // This will trigger the auth modal
                        const authButton = document.querySelector('[data-auth-trigger]') as HTMLButtonElement;
                        if (authButton) {
                          authButton.click();
                        }
                      }}
                      className="block w-full text-center py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      Sign in to contact seller
                    </button>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <div>Owners: <span>{car.owners_count || 'N/A'}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Additional Info</h3>
                
                {/* VIN */}
                {car.vin && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">VIN</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {car.vin}
                    </div>
                  </div>
                )}

                {/* Registration Number */}
                {car.registration_number && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Registration Number</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {car.registration_number}
                    </div>
                  </div>
                )}

                {/* Equipment & Features */}
                {car.equipment && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Equipment & Features</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {car.equipment}
                    </div>
                  </div>
                )}

                {/* Service History */}
                {car.service_history && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Service History</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {car.service_history}
                    </div>
                  </div>
                )}

                {/* Additional Services */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Additional Services</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Vehicle history check</li>
                    <li>Premium listing</li>
                    <li>Seller warranty (if applicable)</li>
                  </ul>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CarDetailsPage;