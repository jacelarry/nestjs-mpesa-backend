# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps
COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/models/schema.sql ./dist/models/schema.sql
EXPOSE 4000
CMD ["node", "dist/index.js"]
