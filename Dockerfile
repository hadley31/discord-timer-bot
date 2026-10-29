FROM oven/bun:latest

WORKDIR /app

COPY bun.lockb .
COPY package.json .

RUN bun install --frozen-lockfile

COPY src ./src

RUN mkdir -p /app/logs && chown bun:bun /app/logs

USER bun

CMD ["bun", "run", "start"]
