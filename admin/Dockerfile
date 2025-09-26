FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
ENV PORT=3005
ENV HOSTNAME=0.0.0.0

EXPOSE 3005

CMD ["npm", "run", "dev"]
