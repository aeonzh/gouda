import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuthorizedBusinesses } from 'packages/shared/api/organisations';
import {
  Category,
  Product,
  getCategories,
  getProducts,
} from 'packages/shared/api/products';

export interface UseStorefrontState {
  loading: boolean;
  error: string | null;
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  storeName: string;
  searchQuery: string;
}

export interface UseStorefrontActions {
  setSearchQuery: (value: string) => void;
  setSelectedCategoryId: (value: string | null) => void;
}

export interface UseStorefrontArgs {
  rawStoreId: unknown;
  userId: string | null;
}

/**
 * Encapsulates storefront data fetching, authorization checks, debounced search,
 * and category filtering.
 */
export function useStorefront({ rawStoreId, userId }: UseStorefrontArgs): [
  UseStorefrontState,
  UseStorefrontActions,
] {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('Store');

  // Normalize storeId: must be a non-empty string
  const storeId: string | null = useMemo(() => {
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
      // eslint-disable-next-line no-console
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
      loading,
      error,
      products,
      categories,
      selectedCategoryId,
      storeName,
      searchQuery,
    },
    {
      setSearchQuery,
      setSelectedCategoryId,
    },
  ];
}


