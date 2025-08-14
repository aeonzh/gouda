import { http, HttpResponse } from 'msw';

const API = 'https://msw.test';

export const handlers = [
  // organisations default
  http.get(`${API}/rest/v1/organisations`, () =>
    HttpResponse.json([
      {
        address_line1: 'a',
        city: 'x',
        country: 'c',
        id: 'b1',
        name: 'Alpha',
        postal_code: '1',
        state: 's',
        status: 'approved',
      },
      {
        address_line1: 'b',
        city: 'y',
        country: 'c',
        id: 'b2',
        name: 'Beta',
        postal_code: '2',
        state: 's',
        status: 'approved',
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
        cart_id: 'c1',
        created_at: '',
        id: 'ci1',
        price_at_time_of_add: 5,
        product: { id: 'p1', name: 'Prod A', price: 5, stock_quantity: 0 },
        product_id: 'p1',
        quantity: 2,
        updated_at: '',
      },
    ]),
  ),
  // update quantity
  http.patch(`${API}/rest/v1/cart_items`, () => HttpResponse.json([])),
  // remove item
  http.delete(
    `${API}/rest/v1/cart_items`,
    () => new HttpResponse(null, { status: 204 }),
  ),
  // orders default
  http.get(`${API}/rest/v1/orders`, () => HttpResponse.json([])),
  // RPC: create_order_from_cart
  http.post(
    `${API}/rest/v1/rpc/create_order_from_cart`,
    async ({ request }) => {
      const body: any = await request.json();
      return HttpResponse.json({
        business_id: body.business_id,
        created_at: new Date().toISOString(),
        id: 'o_rpc',
        status: 'pending',
        total_amount: 0,
        user_id: body.user_id,
      });
    },
  ),
  // health
  http.get(`${API}/health`, () => HttpResponse.json({ ok: true })),
];
