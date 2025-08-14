import { getAuthorizedBusinesses } from 'packages/shared/api/organisations';
import {
  Category,
  getCategories,
  getProducts,
  Product,
} from 'packages/shared/api/products';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseStorefrontActions {
  setSearchQuery: (value: string) => void;
  setSelectedCategoryId: (value: null | string) => void;
}

export interface UseStorefrontArgs {
  rawStoreId: unknown;
  userId: null | string;
}

export interface UseStorefrontState {
  categories: Category[];
  error: null | string;
  loading: boolean;
  products: Product[];
  searchQuery: string;
  selectedCategoryId: null | string;
  storeName: string;
}

/**
 * Encapsulates storefront data fetching, authorization checks, debounced search,
 * and category filtering.
 */
export function useStorefront({
  rawStoreId,
  userId,
}: UseStorefrontArgs): [UseStorefrontState, UseStorefrontActions] {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<null | string>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [storeName, setStoreName] = useState<string>('Store');

  // Normalize storeId: must be a non-empty string
  const storeId: null | string = useMemo(() => {
    if (typeof rawStoreId !== 'string' || rawStoreId.trim().length === 0) {
      return null;
    }
    return rawStoreId;
  }, [rawStoreId]);

  // Debounce search input to reduce queries
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const fetchStoreData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!storeId) {
        setProducts([]);
        setCategories([]);
        setError('Invalid store.');
        return;
      }
      if (!userId) {
        // Wait until we have a userId. Caller controls when to render UI states.
        return;
      }

      const organisations = await getAuthorizedBusinesses(userId);
      const currentOrg = organisations?.find((org) => org.id === storeId);
      if (!currentOrg) {
        setProducts([]);
        setCategories([]);
        setError('Unauthorized storefront.');
        return;
      }
      setStoreName(currentOrg.name);

      const fetchedProducts = await getProducts({
        business_id: storeId,
        category_id: selectedCategoryId || undefined,
        search_query: debouncedQuery || undefined,
        status: 'published',
      });
      setProducts(fetchedProducts || []);

      const fetchedCategories = await getCategories({ business_id: storeId });
      setCategories([{ id: null, name: 'All' }, ...(fetchedCategories || [])]);
    } catch (err) {
       
      console.error('Failed to fetch storefront data:', err);
      setError('Failed to load products or categories.');
    } finally {
      setLoading(false);
    }
  }, [storeId, userId, selectedCategoryId, debouncedQuery]);

  useEffect(() => {
    // Only attempt fetch when we have a normalized storeId. If userId is null
    // we keep loading state until auth resolves and caller renders accordingly.
    if (!storeId) {
      setLoading(false);
      setError('Invalid store.');
      return;
    }
    if (userId) {
      fetchStoreData();
    }
  }, [storeId, userId, fetchStoreData]);

  return [
    {
      categories,
      error,
      loading,
      products,
      searchQuery,
      selectedCategoryId,
      storeName,
    },
    {
      setSearchQuery,
      setSelectedCategoryId,
    },
  ];
}
