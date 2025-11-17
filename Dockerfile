# ---------- Build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Build tools for bcrypt on alpine
RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

# Copy manifests first for better caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy sources
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build NestJS
RUN npx prisma generate
RUN npm run build

# ---------- Production stage ----------
FROM node:22-alpine AS runner
WORKDIR /app

# Only production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy build output and prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/prisma ./prisma

# (optional) copy static assets if you serve any
# COPY public ./public

EXPOSE 3000

# Optional healthcheck (adjust path/controller)
HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD node -e "require('http').request({host:'localhost',port:3000,path:'/api/health',timeout:2000},res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1)).end()"

CMD ["node", "dist/main"]
