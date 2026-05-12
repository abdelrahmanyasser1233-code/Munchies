import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpxuydfourdzanmvnhvs.supabase.co';

// Frontend (student orders) — publishable key
const SUPABASE_ANON_KEY = 'sb_publishable_jE5ydDKAa4NSnaVRXdjx2w_xxxTsPpa';

// Single client for all browser operations
// NOTE: The service/secret key CANNOT be used in the browser (Supabase blocks it).
// All operations use the public anon key. Make sure your Supabase RLS policies
// allow insert/update/delete on the products and orders tables, or disable RLS
// on those tables for development.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── Product Operations ─── */

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchProducts error:', error);
    throw error;
  }
  return data;
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('fetchProductById error:', error);
    throw error;
  }
  return data;
}

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();

  if (error) {
    console.error('createProduct error:', error);
    throw error;
  }
  return data?.[0] || data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('updateProduct error:', error);
    throw error;
  }
  return data?.[0] || data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteProduct error:', error);
    throw error;
  }
  return true;
}

/* ─── Order Operations ─── */

export async function submitOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();

  if (error) {
    console.error('submitOrder error:', error);
    throw error;
  }
  return data?.[0] || data;
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchOrders error:', error);
    throw error;
  }
  return data;
}

/* ─── Image Upload ─── */

export async function uploadProductImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) {
    console.error('uploadProductImage error:', uploadError);
    throw uploadError;
  }

  const { data } = supabase
    .storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
