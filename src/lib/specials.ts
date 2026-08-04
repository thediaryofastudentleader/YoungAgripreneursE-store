import { supabase } from './supabaseClient';
import type { Product, ProductSpecial } from '@/types';

export async function fetchActiveSpecials(): Promise<ProductSpecial[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('product_specials')
    .select('*')
    .eq('active', true);
  if (error || !data) return [];
  return data as ProductSpecial[];
}

export async function fetchAllSpecials(): Promise<ProductSpecial[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('product_specials')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data as ProductSpecial[];
}

export async function setSpecial(productId: string, discountPercent: number, createdBy?: string) {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  const { data, error } = await supabase
    .from('product_specials')
    .upsert(
      { product_id: productId, discount_percent: discountPercent, active: true, created_by: createdBy },
      { onConflict: 'product_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as ProductSpecial;
}

export async function removeSpecial(productId: string) {
  if (!supabase) throw new Error('Store is not connected to the database yet.');
  const { error } = await supabase.from('product_specials').delete().eq('product_id', productId);
  if (error) throw error;
}

// Applies active discounts on top of the static catalogue in data.ts.
// Original price is preserved so the storefront can show a strikethrough.
export function applySpecials(products: Product[], specials: ProductSpecial[]): Product[] {
  if (!specials.length) return products;
  const map = new Map(specials.map(s => [s.product_id, s.discount_percent]));
  return products.map(p => {
    const pct = map.get(p.id);
    if (!pct) return p;
    const original = p.originalPrice ?? p.price;
    const discounted = Math.round(original * (1 - pct / 100) * 100) / 100;
    return { ...p, price: discounted, originalPrice: original, special: true };
  });
}
