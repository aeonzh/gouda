let server: any;
try {
  // Prefer real MSW server in Node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { setupServer } = require('msw/node');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { handlers } = require('./handlers');
  server = setupServer(...handlers);
} catch {
  // Fallback no-op server to avoid missing dependency failures
  server = {
    close: () => undefined,
    listen: () => undefined,
    resetHandlers: () => undefined,
    use: () => undefined,
  };
}

export { server };


