FROM node:22-slim

# Install OpenSSL - Required for Prisma Client
RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm install

COPY server/prisma ./prisma/
COPY server/tsconfig.json ./
# Hack to copy .env only if it exists
COPY server/src ./src/
COPY server/.env* ./

RUN npx prisma generate
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/index.js"]
