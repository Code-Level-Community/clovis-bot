import { ChatInputCommandInteraction, Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { logger } from './utils/logger';
import * as liberar from './commands/liberar';
import * as limite from './commands/limite';
import * as restringir from './commands/restringir';
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
commands.set(restringir.data.name, restringir);
commands.set(liberar.data.name, liberar);

client.once(clientReady.name, () => clientReady.execute(client));
client.on(voiceStateUpdate.name, (oldState, newState) => voiceStateUpdate.execute(oldState, newState, client));

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    logger.error({ err, comando: interaction.commandName }, 'Erro ao executar comando');
    await interaction.reply({ content: '❌ Erro ao executar o comando.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);