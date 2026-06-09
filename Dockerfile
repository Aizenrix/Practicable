FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma/schema.prisma prisma/seed.js ./prisma/
COPY src ./src
COPY public ./public
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

RUN npx prisma generate
RUN chmod +x scripts/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=file:/data/dev.db

EXPOSE 4000

VOLUME ["/data"]

CMD ["./scripts/docker-entrypoint.sh"]
