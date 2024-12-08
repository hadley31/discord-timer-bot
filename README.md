# Discord Timer Bot

This bot will start a timer whenever someone mentions they will join in a certain timeframe.

## Development

### Prereqresites

- [Bun](https://bun.sh/)
- [Docker](https://docs.docker.com/get-docker/) (Optional, but recommended)
- [Discord Bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

### Environment

Create a `.env` file using `.env.example` as a template.

### Run Application Locally (With Docker)

```sh
bun dev:docker
```

### Run Application Locally (Without Docker)

```sh
bun dev
```

### Deploying Commands to a Guild

First, set the following variables in your `.env` file:

```sh
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...
```

## References

- <a href="https://discord.js.org/#/" target="_blank">discord.js</a><br>
