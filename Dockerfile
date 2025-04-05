# Use Node.js 20.x (matches your project's engine requirements)
FROM node:20-alpine

WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache git python3 make g++

# Update npm to latest compatible version
RUN npm install -g npm@10

COPY package*.json ./

# Install dependencies with clean slate
RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]