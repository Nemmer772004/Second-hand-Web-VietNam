FROM node:18-alpine

WORKDIR /app

# Install Python and build tools for native addons
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers

COPY package*.json ./

RUN npm install --production && \
    npm install -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 3007

CMD ["npm", "run", "start:prod"]
