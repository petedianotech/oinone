# Stage 1: Build the compiled full-stack bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Install standard dependencies
COPY package*.json ./
RUN npm ci

# Copy codebase and compile assets & scripts
COPY . .
RUN npm run build

# Stage 2: Production execution environment
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled bundles and static assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
