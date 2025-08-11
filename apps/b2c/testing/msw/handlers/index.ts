import { http, HttpResponse } from 'msw';

const API = 'https://msw.test';

export const handlers = [
  // organisations default
  http.get(`${API}/rest/v1/organisations`, () =>
    HttpResponse.json([
      {
        id: 'b1',
        name: 'Alpha',
        status: 'approved',
        address_line1: 'a',
        city: 'x',
        postal_code: '1',
        country: 'c',
        state: 's',
      },
      {
        id: 'b2',
        name: 'Beta',
        status: 'approved',
        address_line1: 'b',
        city: 'y',
        postal_code: '2',
        country: 'c',
        state: 's',
      },
    ]),
  ),
  // categories default
  http.get(`${API}/rest/v1/categories`, () => HttpResponse.json([])),
  // products default
  http.get(`${API}/rest/v1/products`, () => HttpResponse.json([])),
  // cart_items list
  http.get(`${API}/rest/v1/cart_items`, () =>
    HttpResponse.json([
      {
        id: 'ci1',
        cart_id: 'c1',
        product_id: 'p1',
        quantity: 2,
        price_at_time_of_add: 5,
        created_at: '',
        updated_at: '',
        product: { id: 'p1', name: 'Prod A', price: 5, stock_quantity: 0 },
      },
    ]),
  ),
  // update quantity
  http.patch(`${API}/rest/v1/cart_items`, () => HttpResponse.json([])),
  // remove item
  http.delete(`${API}/rest/v1/cart_items`, () => new HttpResponse(null, { status: 204 })),
  // orders default
  http.get(`${API}/rest/v1/orders`, () => HttpResponse.json([])),
  // RPC: create_order_from_cart
  http.post(`${API}/rest/v1/rpc/create_order_from_cart`, async ({ request }) => {
    const body: any = await request.json();
    return HttpResponse.json({
      id: 'o_rpc',
      user_id: body.user_id,
      business_id: body.business_id,
      total_amount: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }),
  // health
  http.get(`${API}/health`, () => HttpResponse.json({ ok: true })),
];
