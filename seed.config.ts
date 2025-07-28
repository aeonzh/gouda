import { SeedPg } from '@snaplet/seed/adapter-pg';
import { defineConfig } from '@snaplet/seed/config';
import { Client } from 'pg';
import 'dotenv/config';

export default defineConfig({
  adapter: async () => {
    const client = new Client({
      database: 'postgres',
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
    });
    await client.connect();
    return new SeedPg(client);
  },
  select: [
    // We don't alter any extensions tables that might be owned by extensions
    '!*',
    // We want to alter all the tables under public schema
    'public*',
    // We also want to alter some of the tables under the auth schema
    'auth.users',
    'auth.identities',
    'auth.sessions',
  ],
});
