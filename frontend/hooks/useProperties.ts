/**
 * Custom hooks for property data fetching
 */
import { useState, useEffect, useCallback } from 'react';
import { Property, PropertyFilters } from '@/types/property';
import { getProperties, getPropertyById } from '@/lib/getProperties';

/**
 * Hook to fetch and manage properties list
 */
export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProperties(filters);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load properties'));
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return { properties, loading, error, refetch: loadProperties };
}

/**
 * Hook to fetch a single property by ID
 */
export function useProperty(id: string | null | undefined) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProperty() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getPropertyById(id);
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load property'));
        console.error('Error loading property:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  return { property, loading, error };
}

