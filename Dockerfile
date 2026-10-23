FROM node:24-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .
RUN yarn build

FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile --network-timeout 600000 \
  && yarn cache clean

FROM node:24-alpine

ARG VERSION=dev
ARG REVISION
ARG CREATED

LABEL org.opencontainers.image.title="Dashy" \
      org.opencontainers.image.description="The self-hosted dashboard" \
      org.opencontainers.image.url="https://dashy.to" \
      org.opencontainers.image.documentation="https://dashy.to/docs" \
      org.opencontainers.image.source="https://github.com/lissy93/dashy" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.authors="Alicia Sykes <alicia@omg.lol>" \
      org.opencontainers.image.vendor="Alicia Sykes" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.created="${CREATED}"

ENV NODE_ENV=production \
    IS_DOCKER=true \
    PORT=8080

WORKDIR /app

RUN apk upgrade --no-cache \
 && apk add --no-cache tzdata tini iputils-ping \
 && apk add --no-cache --virtual .setcap libcap-setcap \
 && setcap cap_net_raw+ep "$(readlink -f "$(command -v ping)")" \
 && apk del .setcap \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/services ./services
COPY --from=build /app/src/utils/config/ConfigSchema.json ./src/utils/config/ConfigSchema.json
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/user-data/conf.yml ./user-data/conf.yml

USER 1000:1000

EXPOSE 8080

HEALTHCHECK --interval=5m --timeout=10s --start-period=20s --retries=3 \
  CMD node services/healthcheck.js

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
