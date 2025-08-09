import { rest } from 'msw';

// Add specific handlers per API when writing tests.
// These are placeholders to keep server booting.
export const handlers = [
  // Example placeholder. Replace with real endpoints as tests are added.
  rest.get('*/health', (_req, res, ctx) => res(ctx.status(200), ctx.json({ ok: true }))),
];


