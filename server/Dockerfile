FROM node:22-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm install

COPY server/prisma ./prisma/
COPY server/tsconfig.json ./
COPY server/src ./src/

RUN npx prisma generate
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/index.js"]
