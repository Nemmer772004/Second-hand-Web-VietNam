FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Ensure devDependencies are installed so nest CLI is available
ENV NODE_ENV=development
RUN npm install && npm install -g @nestjs/cli

# Copy source code and build
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Install only production deps
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
