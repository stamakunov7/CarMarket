import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  status: 'active' | 'sold' | 'draft';
  created_at: string;
  updated_at: string;
}

interface CreateListingData {
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
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<CreateListingData>({
    title: '',
    description: '',
    price: 0,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    manufacturer: '',
    engine: '',
    drivetrain: '',
    location: '',
    owner_phone: '',
    generation: '',
    body_type: '',
    color: '',
    fuel_type: '',
    engine_volume: 0,
    engine_power: 0,
    transmission: '',
    steering_wheel: '',
    condition: '',
    customs: '',
    region: '',
    registration: '',
    exchange_possible: false,
    availability: true,
    contact_person: '',
    tags: '',
    equipment: '',
    service_history: '',
    owners_count: 1,
    vin: '',
    registration_number: ''
  });

  // Fetch user listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://carmarket-production.up.railway.app/api/users/me/listings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data.listings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Create new listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://carmarket-production.up.railway.app/api/users/me/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const data = await response.json();
      setListings([data.listing, ...listings]);
      setSuccess('Listing created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        price: 0,
        make: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  // Update listing
  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://carmarket-production.up.railway.app/api/users/me/listings/${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: editingListing.status // Preserve the current status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update listing');
      }

      const data = await response.json();
      setListings(listings.map(listing => 
        listing.id === editingListing.id ? data.listing : listing
      ));
      setSuccess('Listing updated successfully!');
      setEditingListing(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        make: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        manufacturer: '',
        engine: '',
        drivetrain: '',
        location: '',
        owner_phone: '',
        generation: '',
        body_type: '',
        color: '',
        fuel_type: '',
        engine_volume: 0,
        engine_power: 0,
        transmission: '',
        steering_wheel: '',
        condition: '',
        customs: '',
        region: '',
        registration: '',
        exchange_possible: false,
        availability: true,
        contact_person: '',
        tags: '',
        equipment: '',
        service_history: '',
        owners_count: 1,
        vin: '',
        registration_number: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    }
  };

  // Delete listing
  const handleDeleteListing = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://carmarket-production.up.railway.app/api/users/me/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      setListings(listings.filter(listing => listing.id !== id));
      setSuccess('Listing deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    }
  };

  // Start editing
  const startEditing = async (listing: Listing) => {
    setEditingListing(listing);
    
    // Fetch full listing details including all fields
    try {
      const response = await fetch(`https://carmarket-production.up.railway.app/api/listings/${listing.id}`);
      if (response.ok) {
        const data = await response.json();
        const fullListing = data.data.listing;
        
        setFormData({
          title: fullListing.title || '',
          description: fullListing.description || '',
          price: fullListing.price || 0,
          make: fullListing.make || '',
          model: fullListing.model || '',
          year: fullListing.year || new Date().getFullYear(),
          mileage: fullListing.mileage || 0,
          manufacturer: fullListing.manufacturer || '',
          engine: fullListing.engine || '',
          drivetrain: fullListing.drivetrain || '',
          location: fullListing.location || '',
          owner_phone: fullListing.owner_phone || '',
          generation: fullListing.generation || '',
          body_type: fullListing.body_type || '',
          color: fullListing.color || '',
          fuel_type: fullListing.fuel_type || '',
          engine_volume: fullListing.engine_volume || 0,
          engine_power: fullListing.engine_power || 0,
          transmission: fullListing.transmission || '',
          steering_wheel: fullListing.steering_wheel || '',
          condition: fullListing.condition || '',
          customs: fullListing.customs || '',
          region: fullListing.region || '',
          registration: fullListing.registration || '',
          exchange_possible: fullListing.exchange_possible || false,
          availability: fullListing.availability !== false,
          contact_person: fullListing.contact_person || '',
          tags: fullListing.tags || '',
          equipment: fullListing.equipment || '',
          service_history: fullListing.service_history || '',
          owners_count: fullListing.owners_count || 1,
          vin: fullListing.vin || '',
          registration_number: fullListing.registration_number || ''
        });
      } else {
        // Fallback to basic fields if API fails
        setFormData({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          mileage: listing.mileage,
          manufacturer: '',
          engine: '',
          drivetrain: '',
          location: '',
          owner_phone: '',
          generation: '',
          body_type: '',
          color: '',
          fuel_type: '',
          engine_volume: 0,
          engine_power: 0,
          transmission: '',
          steering_wheel: '',
          condition: '',
          customs: '',
          region: '',
          registration: '',
          exchange_possible: false,
          availability: true,
          contact_person: '',
          tags: '',
          equipment: '',
          service_history: '',
          owners_count: 1,
          vin: '',
          registration_number: ''
        });
      }
    } catch (err) {
      console.error('Error fetching full listing details:', err);
      // Fallback to basic fields
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        mileage: listing.mileage,
        manufacturer: '',
        engine: '',
        drivetrain: '',
        location: '',
        owner_phone: '',
        generation: '',
        body_type: '',
        color: '',
        fuel_type: '',
        engine_volume: 0,
        engine_power: 0,
        transmission: '',
        steering_wheel: '',
        condition: '',
        customs: '',
        region: '',
        registration: '',
        exchange_possible: false,
        availability: true,
        contact_person: '',
        tags: '',
        equipment: '',
        service_history: '',
        owners_count: 1,
        vin: '',
        registration_number: ''
      });
    }
  };

  // Clear notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your car listings and account settings
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-800 dark:text-red-200">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="text-green-800 dark:text-green-200">{success}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {listings.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Total Listings</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {listings.filter(l => l.status === 'active').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Active Listings</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {listings.filter(l => l.status === 'sold').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Sold</div>
              </div>
            </div>

            {/* Create New Listing Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Listings
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create New Listing
              </button>
            </div>

            {/* Listings */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-600 dark:text-gray-400">Loading your listings...</div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't created any listings yet.
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {listing.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {formatPrice(listing.price)}
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {listing.title || `${listing.year} ${listing.make} ${listing.model}`}
                        {listing.mileage > 0 && ` • ${listing.mileage.toLocaleString()} miles`}
                      </div>
                      
                      {listing.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                        Created: {formatDate(listing.created_at)}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(listing)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">{user?.username}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">{user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingListing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingListing ? 'Edit Listing' : 'Create New Listing'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingListing(null);
                      setFormData({
                        title: '',
                        description: '',
                        price: 0,
                        make: '',
                        model: '',
                        year: new Date().getFullYear(),
                        mileage: 0
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={editingListing ? handleUpdateListing : handleCreateListing} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 2019 Toyota Camry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe your car..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="25000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Make
                      </label>
                      <input
                        type="text"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Toyota"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Camry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mileage
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="45000"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingListing(null);
                        setFormData({
                          title: '',
                          description: '',
                          price: 0,
                          make: '',
                          model: '',
                          year: new Date().getFullYear(),
                          mileage: 0
                        });
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {editingListing ? 'Update Listing' : 'Create Listing'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
