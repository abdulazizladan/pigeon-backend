FROM node:18-alpine

WORKDIR /app

# Install dependencies first
RUN apk add --no-cache git python3 make g++

RUN npm install -g npm@latest && \
    npm install --legacy-peer-deps \
    @nestjs/core@^11 \
    @nestjs/common@^11 \
    @nestjs/websockets@^11 \
    @nestjs/platform-socket.io@^11

COPY package*.json ./

# Use npm ci for production or --legacy-peer-deps if needed

RUN npm ci --legacy-peer-deps

COPY . .

# Uncomment for production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]