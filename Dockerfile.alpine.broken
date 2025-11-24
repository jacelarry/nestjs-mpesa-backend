# Use official Node.js image
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema BEFORE running prisma generate
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the app
COPY . .

# Build NestJS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
