import { useState, useCallback, useMemo } from 'react';

const API_BASE_URL = 'https://carmarket-wo6e.onrender.com/api';

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
}

export interface Listing {
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
  manufacturer?: string;
  engine?: string;
  engine_volume?: string | number;
  engine_power?: number;
  drivetrain?: string;
  location?: string;
  owner_phone?: string;
  primary_image?: string;
  primary_image_id?: number;
  seller_username?: string;
  seller_id?: number;
  image_count?: number;
}

export interface ListingWithImages extends Listing {
  images: Array<{
    id: number;
    image_url: string;
    is_primary: boolean;
    image_order: number;
  }>;
}

// Cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useListings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check cache
  const getCachedData = useCallback((key: string) => {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    if (cached) {
      responseCache.delete(key);
    }
    return null;
  }, []);

  // Helper function to set cache
  const setCachedData = useCallback((key: string, data: any) => {
    responseCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const createListing = async (data: CreateListingData): Promise<Listing | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users/me/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }

      const result = await response.json();
      return result.listing;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create listing';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (listingId: number, files: File[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_BASE_URL}/users/me/listings/${listingId}/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getListings = useCallback(async (filters?: {
    page?: number;
    limit?: number;
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    minMileage?: number;
    maxMileage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
      engineSize?: string[];
    transmission?: string[];
    drivetrain?: string[];
    fuelType?: string[];
    bodyType?: string[];
    condition?: string[];
    customsStatus?: string[];
    steeringWheel?: string[];
    color?: string[];
    generation?: string[];
  }): Promise<{ listings: Listing[]; pagination: any; filters: any } | null> => {
    try {
      // Create cache key
      const cacheKey = `listings:${JSON.stringify(filters || {})}`;
      
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              // Handle array parameters
              value.forEach(item => {
                if (item) {
                  params.append(key, item.toString());
                }
              });
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/listings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const result = await response.json();
      
      if (result.success) {
        // Cache the result
        setCachedData(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch listings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const getListingWithImages = async (listingId: number): Promise<ListingWithImages | null> => {
    try {
      setLoading(true);
      setError(null);

      const [listingResponse, imagesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/listings/${listingId}`),
        fetch(`${API_BASE_URL}/listings/${listingId}/images`)
      ]);

      if (!listingResponse.ok || !imagesResponse.ok) {
        throw new Error('Failed to fetch listing details');
      }

      const listing = await listingResponse.json();
      const images = await imagesResponse.json();

      return {
        ...listing,
        images: images.images
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listing details';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFilterOptions = useCallback(async (): Promise<any> => {
    try {
      const cacheKey = 'filter_options';
      
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/listings/filters/options`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }

      const result = await response.json();
      
      if (result.success) {
        // Cache the result for longer (filter options don't change often)
        setCachedData(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch filter options');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filter options';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const getSearchSuggestions = async (query: string): Promise<any> => {
    try {
      if (!query || query.length < 2) {
        return { suggestions: [] };
      }

      const response = await fetch(`${API_BASE_URL}/listings/search/suggestions?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search suggestions');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch search suggestions');
      }
    } catch (err) {
      console.error('Error fetching search suggestions:', err);
      return { suggestions: [] };
    }
  };

  const getSimilarListings = async (listingId: number, limit: number = 4): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/listings/${listingId}/similar?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch similar listings');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch similar listings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch similar listings';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createListing,
    uploadImages,
    getListings,
    getListingWithImages,
    getFilterOptions,
    getSearchSuggestions,
    getSimilarListings
  };
};
// Force Vercel redeploy
// Force Vercel update Thu Sep 18 00:41:09 EDT 2025
