FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies, NestJS CLI globally, and development dependencies
RUN npm install --legacy-peer-deps && \
    npm install -g @nestjs/cli && \
    npm install --save-dev @types/node

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3006

# Start the application
CMD ["npm", "run", "start:prod"]
