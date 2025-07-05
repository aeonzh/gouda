import { supabase } from './supabase';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  stock_quantity: number;
}

export interface Category {
  id: string | null; // Explicitly allow null for 'All' category
  name: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

/**
 * Fetches a list of products with optional filters and pagination.
 * @param {object} options - Options for filtering and pagination.
 * @param {string} [options.category_id] - Filter by category ID.
 * @param {string} [options.search_query] - Search by product name or description.
 * @param {number} [options.page=1] - Page number for pagination.
 * @param {number} [options.limit=10] - Number of items per page.
 * @returns {Promise<Product[] | null>} A promise that resolves to an array of products or null on error.
 */
export async function getProducts({
  category_id,
  search_query,
  page = 1,
  limit = 10,
}: {
  category_id?: string;
  search_query?: string;
  page?: number;
  limit?: number;
}): Promise<Product[] | null> {
  let query = supabase.from('products').select('*');

  if (category_id) {
    query = query.eq('category_id', category_id);
  }

  if (search_query) {
    query = query.or(
      `name.ilike.%${search_query}%,description.ilike.%${search_query}%`,
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit - 1;
  query = query.range(start, end);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
  return data;
}

/**
 * Fetches a single product by its ID.
 * @param {string} id - The ID of the product to fetch.
 * @returns {Promise<Product | null>} A promise that resolves to the product object or null if not found/error.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product by ID:', error.message);
    throw error;
  }
  return data;
}

/**
 * Creates a new product. (Admin only)
 * @param {Product} productData - The product data to insert.
 * @returns {Promise<Product | null>} A promise that resolves to the created product or null on error.
 */
export async function createProduct(
  productData: Product,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates an existing product. (Admin only)
 * @param {string} id - The ID of the product to update.
 * @param {Partial<Product>} productData - The partial product data to update.
 * @returns {Promise<Product | null>} A promise that resolves to the updated product or null on error.
 */
export async function updateProduct(
  id: string,
  productData: Partial<Product>,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error.message);
    throw error;
  }
  return data;
}

/**
 * Deletes a product by its ID. (Admin only)
 * @param {string} id - The ID of the product to delete.
 * @returns {Promise<void>} A promise that resolves when the product is deleted or rejects on error.
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Error deleting product:', error.message);
    throw error;
  }
}

/**
 * Fetches a list of all categories.
 * @returns {Promise<Category[] | null>} A promise that resolves to an array of categories or null on error.
 */
export async function getCategories(): Promise<Category[] | null> {
  const { data, error } = await supabase.from('categories').select('*');

  if (error) {
    console.error('Error fetching categories:', error.message);
    throw error;
  }
  return data;
}

/**
 * Creates a new category. (Admin only)
 * @param {Category} categoryData - The category data to insert.
 * @returns {Promise<Category | null>} A promise that resolves to the created category or null on error.
 */
export async function createCategory(
  categoryData: Category,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error.message);
    throw error;
  }
  return data;
}

/**
 * Updates an existing category. (Admin only)
 * @param {string} id - The ID of the category to update.
 * @param {Partial<Category>} categoryData - The partial category data to update.
 * @returns {Promise<Category | null>} A promise that resolves to the updated category or null on error.
 */
export async function updateCategory(
  id: string,
  categoryData: Partial<Category>,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error.message);
    throw error;
  }
  return data;
}

/**
 * Deletes a category by its ID. (Admin only)
 * @param {string} id - The ID of the category to delete.
 * @returns {Promise<void>} A promise that resolves when the category is deleted or rejects on error.
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error deleting category:', error.message);
    throw error;
  }
}

/**
 * Fetches current stock levels for all products. (Admin only)
 * @returns {Promise<Product[] | null>} A promise that resolves to an array of products with stock quantities or null on error.
 */
export async function getInventoryLevels(): Promise<InventoryProduct[] | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_quantity'); // Select only relevant fields

  if (error) {
    console.error('Error fetching inventory levels:', error.message);
    throw error;
  }
  return data;
}

/**
 * Adjusts the stock quantity of a product. (Admin only)
 * @param {string} productId - The ID of the product to adjust.
 * @param {number} newQuantity - The new stock quantity.
 * @returns {Promise<Product | null>} A promise that resolves to the updated product or null on error.
 */
export async function adjustInventoryLevel(
  productId: string,
  newQuantity: number,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({ stock_quantity: newQuantity })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error adjusting inventory level:', error.message);
    throw error;
  }
  return data;
}
