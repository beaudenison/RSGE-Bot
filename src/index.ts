import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import { env } from "./config/env";
import {
  handleSearchItemCommand,
  searchItemCommand,
} from "./commands/search-item";
import { GeApiService } from "./services/ge-api";
import { ItemSearchService } from "./services/item-search";

const geApiService = new GeApiService(env.rsUserAgent);
const itemSearchService = new ItemSearchService(geApiService);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(env.discordToken);
  const body = [searchItemCommand.toJSON()];

  if (env.discordGuildId) {
    await rest.put(
      Routes.applicationGuildCommands(env.discordClientId, env.discordGuildId),
      { body }
    );
    console.log(`Registered guild slash commands to guild ${env.discordGuildId}`);
    return;
  }

  await rest.put(Routes.applicationCommands(env.discordClientId), { body });
  console.log("Registered global slash commands");
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  await routeChatInput(interaction);
});

async function routeChatInput(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  if (interaction.commandName === "item") {
    await handleSearchItemCommand(interaction, itemSearchService);
  }
}

async function bootstrap(): Promise<void> {
  await registerCommands();
  await client.login(env.discordToken);
}

bootstrap().catch((error) => {
  console.error("Bot failed to start", error);
  process.exit(1);
});
