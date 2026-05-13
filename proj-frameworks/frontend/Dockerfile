FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN chown -R node:node /app

USER node

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

COPY index.html vite.config.js jsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY scripts/healthcheck.sh /usr/local/bin/healthcheck.sh

EXPOSE 8080

USER root
RUN chmod +x /usr/local/bin/healthcheck.sh && chown -R nginx:nginx /usr/share/nginx/html
USER nginx

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["healthcheck.sh"]
