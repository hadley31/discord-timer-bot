FROM oven/bun:latest

WORKDIR /app

COPY bun.lockb .
COPY package.json .

RUN bun install --frozen-lockfile

COPY src ./src

USER bun

CMD ["bun", "run", "start"]
