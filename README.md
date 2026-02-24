# RSGE-Bot

RSGE-Bot is a Discord bot for searching RuneScape 3 Grand Exchange items and returning rich, clean embeds with live market context.

It combines official RuneScape ItemDB data with realtime trade data so users can query items directly inside Discord.

## What It Shows

- Full ItemDB details (type, members-only, description)
- GE pricing trends (current, today, 30d/90d/180d)
- Realtime market trade price + volume

## Features

- Slash command: `/item name:<query>`
- Smart item matching (exact, prefix, and fuzzy contains)
- Clean Discord embed layout for item details + trends
- Realtime pricing from Weird Gloop exchange history API
- Works as either guild command (instant) or global command
- Docker-first deployment with interactive install script

## Quick Start (Docker + Interactive Installer)

From the project root:

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

The installer will:

1. Prompt for your Discord bot token and client ID
2. Create `.env`
3. Build and start the container with Docker Compose
4. Print invite/permission instructions for your server

## Linux CLI Install (Download + Container Deploy)

Use this if you want a full command-line flow on Linux.

1) Clone the project:

```bash
git clone https://github.com/beaudenison/RSGE-Bot.git
cd RSGE-Bot
```

2) Run the interactive installer (recommended):

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

3) Verify the bot container is running:

```bash
docker compose ps
docker compose logs -f
```

### Linux CLI (Manual Docker Commands)

If you prefer not to use the installer script:

```bash
git clone https://github.com/beaudenison/RSGE-Bot.git
cd RSGE-Bot
cp .env.example .env
# edit .env with DISCORD_TOKEN and DISCORD_CLIENT_ID
docker compose up -d --build
docker compose logs -f
```

## Tech Stack

- Node.js + TypeScript
- discord.js v14
- RuneScape ItemDB API
- Weird Gloop exchange history API

## Commands

- `/item name:<item name>`

Example:

- `/item name:abyssal whip`

## Environment Variables

Create `.env` (or let `scripts/install.sh` create it):

- `DISCORD_TOKEN` (required): Discord bot token
- `DISCORD_CLIENT_ID` (required): Discord application ID
- `DISCORD_GUILD_ID` (optional): Guild ID for immediate slash command registration
- `RS_USER_AGENT` (optional): User-Agent header for API requests

Reference template: `.env.example`

## Manual Setup (Without Installer)

1. Install dependencies:

	```bash
	npm install
	```

2. Copy env file:

	```bash
	cp .env.example .env
	```

3. Fill in `.env` values:

	- `DISCORD_TOKEN`: Bot token
	- `DISCORD_CLIENT_ID`: Application ID
	- `DISCORD_GUILD_ID`: Optional, for faster guild-scoped command registration
	- `RS_USER_AGENT`: Optional custom user-agent for API requests

## Run

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Docker

Build image:

```bash
docker build -t rsge-bot:latest .
```

Run container with your env file:

```bash
docker run --name rsge-bot --env-file .env --restart unless-stopped rsge-bot:latest
```

Run in detached mode:

```bash
docker run -d --name rsge-bot --env-file .env --restart unless-stopped rsge-bot:latest
```

View logs:

```bash
docker logs -f rsge-bot
```

Stop/remove:

```bash
docker stop rsge-bot && docker rm rsge-bot
```

### Docker Compose

```bash
docker compose up -d --build
docker compose logs -f
```

Stop:

```bash
docker compose down
```

Restart:

```bash
docker compose restart
```

## Discord Server Deployment

1. Open the Discord Developer Portal and select your app.
2. Go to `OAuth2` -> `URL Generator`.
3. Enable scopes:
	- `bot`
	- `applications.commands`
4. Enable bot permissions:
	- `View Channels`
	- `Send Messages`
	- `Embed Links`
5. Use generated URL to invite to your server.

Direct invite URL format:

```text
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3072&integration_type=0&scope=bot%20applications.commands
```

## Project Structure

- `src/index.ts` - bot bootstrap and slash-command registration
- `src/commands/search-item.ts` - `/item` command handler
- `src/services/ge-api.ts` - API client for ItemDB + realtime prices
- `src/services/item-search.ts` - matching/ranking logic for item queries
- `src/embeds/item-embed.ts` - Discord embed rendering
- `scripts/install.sh` - interactive Docker installer
- `docker-compose.yml` - container orchestration

## Operations

- View logs: `docker compose logs -f`
- Stop bot: `docker compose down`
- Rebuild after updates: `docker compose up -d --build`

## Troubleshooting

- Slash command not showing:
	- If `DISCORD_GUILD_ID` is set, command registration is fast (usually immediate).
	- Without it, global commands can take time to appear.
- Bot online but command fails:
	- Check logs with `docker compose logs -f`.
	- Confirm token/client ID values in `.env`.
- API issues:
	- Verify outbound internet access from your host/container.
	- Keep `RS_USER_AGENT` set to a descriptive value.
