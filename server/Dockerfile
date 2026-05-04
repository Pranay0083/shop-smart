# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# generate prisma client for linux (same env)
RUN npx prisma generate


# Stage 2: Production
FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# copy full app (safer)
COPY --from=builder /app ./

# security
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5001

CMD ["node", "src/server.js"]