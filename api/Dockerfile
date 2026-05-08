FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose the port (Hono default or from env)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "index.ts"]
