# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install global Nest CLI for building
RUN npm install -g @nestjs/cli

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig*.json ./
COPY src ./src
COPY nest-cli.json ./

# Build the project
RUN nest build

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /app/dist ./dist

# Set environment variable
ENV NODE_ENV=production

# Expose port
EXPOSE 4101

# Start the application
CMD ["node", "dist/main"]
