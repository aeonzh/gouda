import fetch from 'node-fetch';

const base = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const anon = process.env.SUPABASE_ANON_KEY || 'anon-key';

async function api(path, { method = 'GET', body } = {}) {
  const url = `${base}/rest/v1/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function main() {
  // list products
  const products = await api('products?select=id,name&limit=1');
  if (products.status !== 200) throw new Error('Products list failed');

  // create cart then item
  const userId = '00000000-0000-0000-0000-000000000000';
  const businessId = products.data?.[0]?.business_id || null;
  await api('carts', { method: 'POST', body: [{ user_id: userId, business_id: businessId }] });
  const carts = await api(`carts?user_id=eq.${userId}&business_id=eq.${businessId}&select=id&limit=1`);
  const cartId = carts.data?.[0]?.id;
  await api('cart_items', { method: 'POST', body: [{ cart_id: cartId, product_id: products.data?.[0]?.id, quantity: 1, price_at_time_of_add: 1 }] });

  // create order (minimal smoke)
  const order = await api('orders', { method: 'POST', body: [{ user_id: userId, business_id: businessId, status: 'pending', total_amount: 1 }] });
  if (order.status !== 201) throw new Error('Order create failed');

  console.log('Live smoke OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


