FROM node:18-slim AS base

# Install system dependencies for PDF processing
# libreoffice: For converting documents to PDF
# ghostscript: For reducing PDF size, etc.
# poppler-utils: For pdfinfo, pdftoppm, etc.
RUN apt-get update && apt-get install -y \
    libreoffice \
    ghostscript \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

FROM base AS builder
WORKDIR /app
# We would copy the monorepo context here, but for dev we might rely on volume mapping or 
# just copying the built artifact. For a simple setup, lets assume we are building within the context.
# Since this is a monorepo, a real production dockerfile is more complex (needs pruning).
# For dev/skeleton purposes, we will stick to a simple node setup that assumes pre-built or live-reload.

# NOTE: In a real monorepo 'turbo prune' is used. keeping it simple for dev scaffold.

COPY . .
RUN npm install -g pnpm
RUN pnpm install

CMD ["pnpm", "run", "dev", "--filter", "api"]
