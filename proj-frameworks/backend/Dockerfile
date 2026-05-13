FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install
RUN chown -R node:node /app

FROM base AS build

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV UPLOAD_DIR=uploads

RUN apk add --no-cache openssl

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY scripts ./scripts

RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "scripts/healthcheck.js"]

CMD ["sh", "-c", "npm run prisma:deploy && npm run start"]
