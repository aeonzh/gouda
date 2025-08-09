import { rest } from 'msw';

const API = 'https://msw.test';

export const handlers = [
  // cart_items list
  rest.get(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json([]))
  ),
  // update quantity
  rest.patch(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
    res(ctx.status(200), ctx.json([]))
  ),
  // remove item
  rest.delete(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
    res(ctx.status(204))
  ),
  // health
  rest.get(`${API}/health`, (_req, res, ctx) => res(ctx.status(200), ctx.json({ ok: true }))),
];


