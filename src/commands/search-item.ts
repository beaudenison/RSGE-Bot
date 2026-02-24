import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { buildItemEmbed } from "../embeds/item-embed";
import { ItemSearchService } from "../services/item-search";

export const searchItemCommand:
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
  .setName("item")
  .setDescription("Search RuneScape 3 GE item information")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Item name to search")
      .setRequired(true)
  );

export async function handleSearchItemCommand(
  interaction: ChatInputCommandInteraction,
  itemSearchService: ItemSearchService
): Promise<void> {
  const query = interaction.options.getString("name", true);

  await interaction.deferReply();

  try {
    const result = await itemSearchService.search(query);

    if (!result) {
      await interaction.editReply({
        content: `No RuneScape 3 GE item found for **${query}**. Try a different spelling or a shorter prefix.`,
      });
      return;
    }

    const embed = buildItemEmbed(result);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({
      content:
        "I couldn't fetch item data right now. Please try again in a moment.",
    });

    console.error("Item command failed", error);
  }
}
