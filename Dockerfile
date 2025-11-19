# ---- build --------
FROM node:24.11.1-alpine3.21 AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ----- Production ------
FROM node:22-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# COPY public ./public

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD node -e "require('http').request({host:'localhost',port:3000,path:'/api/health',timeout:2000},res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1)).end()"


CMD ["node", "dist/main"]
