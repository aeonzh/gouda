import { rest } from 'msw';

const API = 'https://msw.test';

export const handlers = [
  // organisations default
  rest.get(`${API}/rest/v1/organisations`, (_req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json([
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
  ),
  // categories default
  rest.get(`${API}/rest/v1/categories`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json([])),
  ),
  // products default
  rest.get(`${API}/rest/v1/products`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json([])),
  ),
  // cart_items list
  rest.get(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json([
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
  ),
  // update quantity
  rest.patch(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json([])),
  ),
  // remove item
  rest.delete(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
    res(ctx.status(204)),
  ),
  // orders default
  rest.get(`${API}/rest/v1/orders`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json([])),
  ),
  // health
  rest.get(`${API}/health`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ ok: true })),
  ),
];
