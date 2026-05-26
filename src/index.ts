import { ChatInputCommandInteraction, Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import * as limite from './commands/limite';
import * as clientReady from './events/clientReady';
import * as voiceStateUpdate from './events/voiceStateUpdate';

interface Command {
  data: { name: string; toJSON: () => object };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();
commands.set(limite.data.name, limite);

client.once(clientReady.name, () => clientReady.execute(client));
client.on(voiceStateUpdate.name, (oldState, newState) => voiceStateUpdate.execute(oldState, newState, client));

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Erro ao executar o comando.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);