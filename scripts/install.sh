#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but was not found on PATH."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Docker Compose is required but was not found."
  exit 1
fi

read -rsp "Discord bot token (DISCORD_TOKEN): " DISCORD_TOKEN
echo
while [[ -z "${DISCORD_TOKEN}" ]]; do
  echo "DISCORD_TOKEN is required."
  read -rsp "Discord bot token (DISCORD_TOKEN): " DISCORD_TOKEN
  echo
done

read -rp "Discord application/client ID (DISCORD_CLIENT_ID): " DISCORD_CLIENT_ID
while [[ -z "${DISCORD_CLIENT_ID}" ]]; do
  echo "DISCORD_CLIENT_ID is required."
  read -rp "Discord application/client ID (DISCORD_CLIENT_ID): " DISCORD_CLIENT_ID
done

read -rp "Discord guild ID for fast slash command registration (optional): " DISCORD_GUILD_ID
DEFAULT_UA="RSGE-Bot/1.0 (+https://github.com/beaudenison/RSGE-Bot)"
read -rp "RS API user-agent [${DEFAULT_UA}]: " RS_USER_AGENT
RS_USER_AGENT="${RS_USER_AGENT:-$DEFAULT_UA}"

cat > "${ENV_FILE}" <<EOF
DISCORD_TOKEN=${DISCORD_TOKEN}
DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
RS_USER_AGENT=${RS_USER_AGENT}
EOF

echo "Created ${ENV_FILE}"

cd "${PROJECT_DIR}"

${COMPOSE_CMD} up -d --build

echo
echo "RSGE-Bot has been deployed in Docker."
echo
echo "Next steps to add the bot to your server:"
echo "1) Open Discord Developer Portal: https://discord.com/developers/applications"
echo "2) Select your application and go to OAuth2 -> URL Generator."
echo "3) Scopes: check 'bot' and 'applications.commands'."
echo "4) Bot Permissions: check 'View Channels', 'Send Messages', and 'Embed Links'."
echo "5) Open the generated URL, choose your server, and authorize the bot."
echo
echo "Optional direct invite URL:"
echo "https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=3072&integration_type=0&scope=bot%20applications.commands"
echo
echo "Useful commands:"
echo "- View logs: ${COMPOSE_CMD} logs -f"
echo "- Restart:   ${COMPOSE_CMD} restart"
echo "- Stop:      ${COMPOSE_CMD} down"
