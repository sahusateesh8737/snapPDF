FROM node:20-slim

# Install LibreOffice, fonts, and tini init system
RUN apt-get update && apt-get install -y \
    tini \
    libreoffice \
    unoconv \
    libreoffice-script-provider-python \
    fonts-opensymbol \
    hyphen-fr \
    hyphen-de \
    hyphen-en-us \
    hyphen-it \
    hyphen-ru \
    fonts-dejavu \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    fonts-droid-fallback \
    fonts-dustin \
    fonts-f500 \
    fonts-fanwood \
    fonts-freefont-ttf \
    fonts-liberation \
    fonts-lmodern \
    fonts-lyx \
    fonts-sil-gentium \
    fonts-texgyre \
    fonts-tlwg-purisa \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install PNPM
RUN npm install -g pnpm

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies (frozen-lockfile ensures we use the exact versions)
RUN pnpm install --frozen-lockfile

# Build the API specifically
# We filter to just the 'api' package and its dependencies
RUN pnpm build --filter=api...

# Create storage directories explicitly (if not created by build)
RUN mkdir -p obs/uploads && mkdir -p obs/outputs

# Expose port
EXPOSE 4000

# Set environment variables for writable LibreOffice configuration
ENV HOME=/tmp
ENV XDG_CONFIG_HOME=/tmp

# Use Tini to manage background processes and handle signals
ENTRYPOINT ["/usr/bin/tini", "--"]

# Make sure the startup script is executable
RUN chmod +x scripts/start-container.sh

# Start command using our optimized listener script
CMD ["./scripts/start-container.sh"]
