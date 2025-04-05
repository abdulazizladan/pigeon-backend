FROM node:18-alpine

WORKDIR /app

# Install dependencies first
RUN apk add --no-cache git python3 make g++

COPY package*.json ./

# Use npm ci for production or --legacy-peer-deps if needed
RUN npm install --legacy-peer-deps

COPY . .

# Uncomment for production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]