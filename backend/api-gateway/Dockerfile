FROM node:18-alpine AS builder

WORKDIR /app

# Install build tools
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    git \
    openssl \
    bash

# Copy package files
COPY package*.json ./

# Install dev dependencies and nest cli for build
ENV NODE_ENV=development
RUN npm install && npm install -g @nestjs/cli && npm rebuild bcrypt --build-from-source

# Copy source code and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install only prod deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built dist from builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main.js"]
