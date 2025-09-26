FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS="--experimental-specifier-resolution=node"

EXPOSE 3004

CMD ["npm", "start"]
