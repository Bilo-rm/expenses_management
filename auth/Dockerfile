FROM node:18 AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --build-from-source

# Copy application files
COPY . .

# Production image
FROM node:18
WORKDIR /usr/src/app

# Copy dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
