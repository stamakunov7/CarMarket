import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useListings } from '../hooks/useListings';
import { 
  carData, 
  engineSizes, 
  transmissionTypes, 
  drivetrainTypes, 
  fuelTypes, 
  bodyTypes, 
  carConditions, 
  customsStatus, 
  steeringWheelPositions 
} from '../data/cars';

const SellPage: React.FC = () => {
  const { theme } = useTheme();
  const { createListing, uploadImages, loading, error } = useListings();
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'contact'>('details');
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    make: '',
    model: '',
    year: '',
    generation: '',
    body_type: '',
    color: '',
    mileage: '',
    price: '',
    
    // Engine & Performance
    fuel_type: '',
    engine_volume: '',
    engine_power: '',
    transmission: '',
    drivetrain: '',
    steering_wheel: '',
    
    // Condition & Status
    condition: '',
    customs: '',
    region: '',
    registration: '',
    exchange_possible: false,
    availability: true,
    
    // Contact Information
    contact_person: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    owner_phone: '',
    
    // Additional Details
    description: '',
    tags: '',
    equipment: '',
    service_history: '',
    owners_count: 1,
    vin: '',
    registration_number: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [enginePowerError, setEnginePowerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dependent dropdown states
  const [availableModels, setAvailableModels] = useState<{name: string, generations: string[]}[]>([]);
  const [availableGenerations, setAvailableGenerations] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Handle engine_power validation
      if (name === 'engine_power') {
        // Allow empty value
        if (value === '') {
          setFormData(prev => ({ ...prev, [name]: value }));
          setEnginePowerError('');
          return;
        }
        
        // Check if input is numeric
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          // Don't allow non-numeric input
          return;
        }
        
        // Check digit count (max 4 digits)
        if (value.length > 4) {
          // Don't allow input with more than 4 digits
          return;
        }
        
        // Allow numeric input with correct digit count
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Don't show error while typing - only on blur
        setEnginePowerError('');
        return; // Don't continue with other logic for engine_power
      }
      
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Handle dependent dropdowns
      if (name === 'make') {
        const selectedMake = carData.find(make => make.make === value);
        if (selectedMake) {
          setAvailableModels(selectedMake.models);
          setFormData(prev => ({ ...prev, model: '', generation: '' }));
          setAvailableGenerations([]);
        } else {
          setAvailableModels([]);
          setAvailableGenerations([]);
        }
      } else if (name === 'model') {
        const selectedModel = availableModels.find(model => model.name === value);
        if (selectedModel) {
          setAvailableGenerations(selectedModel.generations);
          setFormData(prev => ({ ...prev, generation: '' }));
        } else {
          setAvailableGenerations([]);
        }
      }
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files);
    setImages(prev => [...prev, ...newImages]);
    
    // Create preview URLs
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.price || !formData.make || !formData.model) {
      alert('Please fill in all required fields (Title, Price, Make, Model)');
      return;
    }

    // Validate engine power
    const enginePower = parseInt(formData.engine_power);
    if (!formData.engine_power) {
      alert('Engine power is required');
      return;
    }
    if (formData.engine_power.length < 2) {
      alert('Engine power must be at least 2 digits');
      return;
    }
    if (formData.engine_power.length > 4) {
      alert('Engine power must be no more than 4 digits');
      return;
    }
    if (enginePower < 50 || enginePower > 2000) {
      alert('Engine power must be between 50 and 2000 hp');
      return;
    }

    try {
      // Create listing
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price) || 0,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year) || new Date().getFullYear(),
        mileage: parseInt(formData.mileage) || 0,
        manufacturer: formData.make,
        drivetrain: formData.drivetrain,
        location: formData.location,
        owner_phone: formData.phone,
        generation: formData.generation,
        body_type: formData.body_type,
        color: formData.color,
        fuel_type: formData.fuel_type,
        engine_volume: parseFloat(formData.engine_volume) || 0,
        engine_power: parseInt(formData.engine_power) || 0,
        transmission: formData.transmission,
        steering_wheel: formData.steering_wheel,
        condition: formData.condition,
        customs: formData.customs,
        region: formData.region,
        registration: formData.registration,
        exchange_possible: Boolean(formData.exchange_possible),
        availability: Boolean(formData.availability),
        contact_person: formData.contact_person,
        tags: formData.tags,
        equipment: formData.equipment,
        service_history: formData.service_history,
        owners_count: typeof formData.owners_count === 'number' ? formData.owners_count : parseInt(formData.owners_count) || 1,
        vin: formData.vin,
        registration_number: formData.registration_number
      };

      const listing = await createListing(listingData);
      
      if (listing && images.length > 0) {
        // Upload images
        const uploadSuccess = await uploadImages(listing.id, images);
        
        if (uploadSuccess) {
          setSubmitSuccess(true);
          // Reset form
          setFormData({
            // Basic Information
            title: '',
            make: '',
            model: '',
            year: '',
            generation: '',
            body_type: '',
            color: '',
            mileage: '',
            price: '',
            
            // Engine & Performance
            fuel_type: '',
            engine_volume: '',
            engine_power: '',
            transmission: '',
            drivetrain: '',
            steering_wheel: '',
            
            // Condition & Status
            condition: '',
            customs: '',
            region: '',
            registration: '',
            exchange_possible: false,
            availability: true,
            
            // Contact Information
            contact_person: '',
            name: '',
            email: '',
            phone: '',
            location: '',
            owner_phone: '',
            
            // Additional Details
            description: '',
            tags: '',
            equipment: '',
            service_history: '',
            owners_count: 1,
            vin: '',
            registration_number: ''
          });
          setImages([]);
          setPreviewUrls([]);
          setActiveTab('details');
        }
      } else if (listing) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          // Basic Information
          title: '',
          make: '',
          model: '',
          year: '',
          generation: '',
          body_type: '',
          color: '',
          mileage: '',
          price: '',
          
          // Engine & Performance
          fuel_type: '',
          engine_volume: '',
          engine_power: '',
          transmission: '',
          drivetrain: '',
          steering_wheel: '',
          
          // Condition & Status
          condition: '',
          customs: '',
          region: '',
          registration: '',
          exchange_possible: false,
          availability: true,
          
          // Contact Information
          contact_person: '',
          name: '',
          email: '',
          phone: '',
          location: '',
          owner_phone: '',
          
          // Additional Details
          description: '',
          tags: '',
          equipment: '',
          service_history: '',
          owners_count: 1,
          vin: '',
          registration_number: ''
        });
        setImages([]);
        setPreviewUrls([]);
        setActiveTab('details');
      }
    } catch (err) {
      console.error('Error submitting listing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Sell Your Car</h1>
            
            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-green-800 dark:text-green-200">
                  Your listing has been created successfully! Images are being uploaded...
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-red-800 dark:text-red-200">{error}</div>
              </div>
            )}
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'details'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Car Details
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'images'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('images')}
              >
                Images
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'contact'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('contact')}
              >
                Contact Info
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Car Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                    <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title *
                      </label>
                      <input
                        type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="e.g., 2019 Toyota Camry"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Make *
                          </label>
                          <select
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                          >
                            <option value="">Select Make</option>
                            {carData.map(make => (
                              <option key={make.make} value={make.make}>{make.make}</option>
                            ))}
                          </select>
                    </div>
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Model *
                      </label>
                          <select
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                            disabled={!formData.make}
                          >
                            <option value="">Select Model</option>
                            {availableModels.map(model => (
                              <option key={model.name} value={model.name}>{model.name}</option>
                            ))}
                          </select>
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Year *
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      >
                        <option value="">Select Year</option>
                            {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="generation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Generation
                          </label>
                          <select
                            id="generation"
                            name="generation"
                            value={formData.generation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            disabled={!formData.model}
                          >
                            <option value="">Select Generation</option>
                            {availableGenerations.map(generation => (
                              <option key={generation} value={generation}>{generation}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="body_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Body Type *
                          </label>
                          <select
                            id="body_type"
                            name="body_type"
                            value={formData.body_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Body Type</option>
                            {bodyTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Color
                          </label>
                          <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="e.g., White, Black, Red"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mileage (miles) *
                      </label>
                      <input
                        type="number"
                        id="mileage"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Price ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                          $
                        </span>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          required
                        />
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>

                  {/* Engine & Performance Section */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engine & Performance</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="engine_volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Engine Size *
                          </label>
                          <select
                            id="engine_volume"
                            name="engine_volume"
                            value={formData.engine_volume}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Engine Size</option>
                            {engineSizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fuel Type *
                          </label>
                          <select
                            id="fuel_type"
                            name="fuel_type"
                            value={formData.fuel_type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Fuel Type</option>
                            {fuelTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="engine_power" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Engine Power (hp) *
                        </label>
                        <input
                          type="number"
                          id="engine_power"
                          name="engine_power"
                          value={formData.engine_power}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            const value = e.target.value;
                            const numValue = parseInt(value);
                            
                            if (value) {
                              if (value.length < 2 || value.length > 4) {
                                setEnginePowerError('Engine power must be 2-4 digits');
                              } else if (numValue < 50 || numValue > 2000) {
                                setEnginePowerError('Engine power must be between 50 and 2000 hp');
                              } else {
                                setEnginePowerError('');
                              }
                            } else {
                              setEnginePowerError('');
                            }
                          }}
                          className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                            enginePowerError 
                              ? 'border-red-500 dark:border-red-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="e.g., 200 (2-4 digits, 50-2000 hp)"
                          min="50"
                          max="2000"
                          required
                        />
                        {enginePowerError && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {enginePowerError}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Transmission *
                          </label>
                          <select
                            id="transmission"
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Transmission</option>
                            {transmissionTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Drivetrain *
                          </label>
                          <select
                            id="drivetrain"
                            name="drivetrain"
                            value={formData.drivetrain}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Drivetrain</option>
                            {drivetrainTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="steering_wheel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Steering Wheel Position *
                        </label>
                        <select
                          id="steering_wheel"
                          name="steering_wheel"
                          value={formData.steering_wheel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          required
                        >
                            <option value="">Select Position</option>
                          {steeringWheelPositions.map(position => (
                            <option key={position} value={position}>{position} ({position === 'Left' ? 'LHD' : 'RHD'})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Condition & Status Section */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Condition & Status</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Condition *
                          </label>
                          <select
                            id="condition"
                            name="condition"
                            value={formData.condition}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Condition</option>
                            {carConditions.map(condition => (
                              <option key={condition} value={condition}>{condition}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="customs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Customs Status *
                          </label>
                          <select
                            id="customs"
                            name="customs"
                            value={formData.customs}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                          >
                            <option value="">Select Status</option>
                            {customsStatus.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Region
                          </label>
                          <input
                            type="text"
                            id="region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="e.g., Florida, California"
                          />
                        </div>
                        <div>
                          <label htmlFor="registration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Registration Country
                          </label>
                          <input
                            type="text"
                            id="registration"
                            name="registration"
                            value={formData.registration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="e.g., USA, Canada"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="exchange_possible"
                            name="exchange_possible"
                            checked={formData.exchange_possible}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="exchange_possible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Exchange Possible
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="availability"
                            name="availability"
                            checked={formData.availability}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="availability" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Available for Sale
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Details Section */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h3>
                    <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Describe your car's condition, features, and any other relevant information..."
                      required
                    />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tags
                          </label>
                          <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="e.g., Urgent, VIP, Low Mileage"
                          />
                        </div>
                        <div>
                          <label htmlFor="owners_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Number of Owners
                          </label>
                          <input
                            type="number"
                            min="1"
                            id="owners_count"
                            name="owners_count"
                            value={formData.owners_count}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="vin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            VIN
                          </label>
                          <input
                            type="text"
                            id="vin"
                            name="vin"
                            value={formData.vin}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="17-character VIN"
                            maxLength={17}
                          />
                        </div>
                        <div>
                          <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Registration Number
                          </label>
                          <input
                            type="text"
                            id="registration_number"
                            name="registration_number"
                            value={formData.registration_number}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="License plate number"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Equipment & Features
                        </label>
                        <textarea
                          id="equipment"
                          name="equipment"
                          value={formData.equipment}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="List all equipment, features, and options..."
                        />
                      </div>

                      <div>
                        <label htmlFor="service_history" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Service History
                        </label>
                        <textarea
                          id="service_history"
                          name="service_history"
                          value={formData.service_history}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="Describe maintenance history, repairs, and service records..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    } transition-colors duration-200`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Drag and drop your images here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        browse
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                        <div>
                          <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            id="contact_person"
                            name="contact_person"
                            value={formData.contact_person}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Name for listing display"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      />
                    </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="owner_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Owner Phone (for listing)
                          </label>
                          <input
                            type="tel"
                            id="owner_phone"
                            name="owner_phone"
                            value={formData.owner_phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Phone number to display in listing"
                          />
                        </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="City, State"
                        required
                      />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'details') {
                        setActiveTab('contact');
                      } else if (activeTab === 'contact') {
                        setActiveTab('images');
                      } else if (activeTab === 'images') {
                        setActiveTab('details');
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'details') {
                        setActiveTab('images');
                      } else if (activeTab === 'images') {
                        setActiveTab('contact');
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
                {activeTab === 'contact' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Listing...
                      </>
                    ) : (
                      'Submit Listing'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage; 