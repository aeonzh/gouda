import { http } from 'msw';

// Mock handlers for testing
export const handlers = [
  // Auth endpoints
  http.post('/auth/v1/token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock-token',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
      }),
    );
  }),

  // Supabase auth endpoints
  http.post('/auth/v1/verify', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: { email: 'test@example.com', id: 'test-user' },
      }),
    );
  }),

  // Generic catch-all for unhandled requests
  // This handler should be added to the server directly, not to http
  // http.use((req, res, ctx) => {
  //   console.warn(`[MSW] Unhandled ${req.method} ${req.url}`);
  //   return res(ctx.status(404), ctx.json({ error: 'Mock handler not found' }));
  // }),
];
