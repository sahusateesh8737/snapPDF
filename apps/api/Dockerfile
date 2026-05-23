FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package.json and workspace configuration
COPY package.json pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy the api package
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies
RUN pnpm install --filter api...

# Build the api package
RUN pnpm run build --filter api

# Expose port
EXPOSE 4000

# Start the application
CMD ["pnpm", "run", "start", "--filter", "api"]
