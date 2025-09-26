FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
ENV NODE_ENV=development
RUN npm install && npm install -g @nestjs/cli

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY package*.json ./
ENV NODE_ENV=production
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
