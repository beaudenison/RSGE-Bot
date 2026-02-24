import { config as loadDotEnv } from "dotenv";

loadDotEnv();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  discordToken: requireEnv("DISCORD_TOKEN"),
  discordClientId: requireEnv("DISCORD_CLIENT_ID"),
  discordGuildId: process.env.DISCORD_GUILD_ID,
  rsUserAgent:
    process.env.RS_USER_AGENT ||
    "RSGE-Bot/1.0 (+https://github.com/beaudenison/RSGE-Bot)",
};
