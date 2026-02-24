import { EmbedBuilder } from "discord.js";
import { EnrichedItemResult, ItemDbTrend } from "../types/runescape-item";
import {
  formatPrice,
  formatRelativeTime,
  formatSignedChange,
} from "../utils/format-price";

function trendEmoji(trend: ItemDbTrend): string {
  if (trend === "positive") {
    return "📈";
  }
  if (trend === "negative") {
    return "📉";
  }
  return "➖";
}

function trendColor(trend: ItemDbTrend): number {
  if (trend === "positive") {
    return 0x22c55e;
  }
  if (trend === "negative") {
    return 0xef4444;
  }
  return 0x64748b;
}

export function buildItemEmbed(result: EnrichedItemResult): EmbedBuilder {
  const { item, realtime, alternatives } = result;
  const isMembers = item.members.toLowerCase() === "true";

  const embed = new EmbedBuilder()
    .setColor(trendColor(item.current.trend))
    .setTitle(`${item.name}`)
    .setURL(`https://services.runescape.com/m=itemdb_rs/viewitem?obj=${item.id}`)
    .setDescription(item.description)
    .setThumbnail(item.icon_large)
    .addFields(
      {
        name: "Item",
        value: `ID: **${item.id}**\nType: **${item.type}**\nMembers: **${
          isMembers ? "Yes" : "No"
        }**`,
        inline: true,
      },
      {
        name: "Grand Exchange",
        value: `${trendEmoji(item.current.trend)} Current: **${formatPrice(
          item.current.price
        )}**\n${trendEmoji(item.today.trend)} Today: **${formatSignedChange(
          item.today.price
        )}**`,
        inline: true,
      },
      {
        name: "Trends",
        value: `${trendEmoji(item.day30.trend)} 30d: **${item.day30.change}**\n${trendEmoji(
          item.day90.trend
        )} 90d: **${item.day90.change}**\n${trendEmoji(item.day180.trend)} 180d: **${
          item.day180.change
        }**`,
        inline: true,
      }
    )
    .setFooter({ text: "Data: RuneScape ItemDB + Weird Gloop API" })
    .setTimestamp();

  if (realtime) {
    embed.addFields({
      name: "Realtime Market",
      value: `Last trade: **${formatPrice(realtime.price)}**\nVolume: **${realtime.volume.toLocaleString()}**\nUpdated: **${formatRelativeTime(
        realtime.timestamp
      )}**`,
      inline: false,
    });
  }

  if (alternatives.length > 0) {
    embed.addFields({
      name: "Closest Matches",
      value: alternatives
        .slice(0, 5)
        .map((itemCandidate) => `• ${itemCandidate.name} (ID: ${itemCandidate.id})`)
        .join("\n"),
      inline: false,
    });
  }

  return embed;
}
