import { defineConfig } from 'prisma/defineConfig';

export default defineConfig({
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
});
