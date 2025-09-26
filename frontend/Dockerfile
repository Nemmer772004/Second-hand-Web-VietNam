# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies with legacy peer deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Ensure Next CLI is present even if npm cached layer missed it
RUN npm install next@14.2.15 --no-save --legacy-peer-deps

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
ENV PATH $PATH:/app/node_modules/.bin
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files from builder
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install production dependencies only
RUN npm install --only=production --legacy-peer-deps

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 9002

CMD ["npm", "start"]
