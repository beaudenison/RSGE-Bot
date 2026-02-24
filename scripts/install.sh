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

TTY_INPUT=""
if [[ -r /dev/tty ]]; then
  TTY_INPUT="/dev/tty"
fi

prompt_required() {
  local prompt="$1"
  local value="${2:-}"

  while [[ -z "${value}" ]]; do
    if [[ -n "${TTY_INPUT}" ]]; then
      read -rp "${prompt}" value < "${TTY_INPUT}"
    else
      read -rp "${prompt}" value
    fi

    if [[ -z "${value}" ]]; then
      echo "This value is required."
    fi
  done

  printf '%s' "${value}"
}

prompt_optional() {
  local prompt="$1"
  local default_value="${2:-}"
  local value=""

  if [[ -n "${TTY_INPUT}" ]]; then
    read -rp "${prompt}" value < "${TTY_INPUT}"
  else
    read -rp "${prompt}" value
  fi

  if [[ -z "${value}" ]]; then
    printf '%s' "${default_value}"
    return
  fi

  printf '%s' "${value}"
}

prompt_secret_required() {
  local prompt="$1"
  local value="${2:-}"

  while [[ -z "${value}" ]]; do
    if [[ -n "${TTY_INPUT}" ]]; then
      printf "%s" "${prompt}" > "${TTY_INPUT}"
      stty -echo < "${TTY_INPUT}"
      IFS= read -r value < "${TTY_INPUT}"
      stty echo < "${TTY_INPUT}"
      printf "\n" > "${TTY_INPUT}"
    else
      read -rsp "${prompt}" value
      echo
    fi

    if [[ -z "${value}" ]]; then
      echo "This value is required."
    fi
  done

  printf '%s' "${value}"
}

DISCORD_TOKEN="$(prompt_secret_required "Discord bot token (DISCORD_TOKEN): " "${DISCORD_TOKEN:-}")"
DISCORD_CLIENT_ID="$(prompt_required "Discord application/client ID (DISCORD_CLIENT_ID): " "${DISCORD_CLIENT_ID:-}")"
DISCORD_GUILD_ID="$(prompt_optional "Discord guild ID for fast slash command registration (optional): " "${DISCORD_GUILD_ID:-}")"
DEFAULT_UA="RSGE-Bot/1.0 (+https://github.com/beaudenison/RSGE-Bot)"
RS_USER_AGENT="$(prompt_optional "RS API user-agent [${DEFAULT_UA}]: " "${RS_USER_AGENT:-$DEFAULT_UA}")"
WEB_PORT="$(prompt_optional "Web interface port [3000]: " "${WEB_PORT:-3000}")"

cat > "${ENV_FILE}" <<EOF
DISCORD_TOKEN=${DISCORD_TOKEN}
DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
RS_USER_AGENT=${RS_USER_AGENT}
WEB_PORT=${WEB_PORT}
EOF

echo "Created ${ENV_FILE}"

cd "${PROJECT_DIR}"

${COMPOSE_CMD} up -d --build

echo
echo "RSGE-Bot has been deployed in Docker."
echo "Web interface: http://localhost:${WEB_PORT}"
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
