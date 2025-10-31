FROM oven/bun:1 AS base

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && update-ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install dependencies with better cache reuse
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy application sources
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
