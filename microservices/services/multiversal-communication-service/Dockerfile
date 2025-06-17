FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN mkdir -p logs && chown -R nodejs:nodejs logs
USER nodejs
EXPOSE 8054
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8054/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/index.js"]
