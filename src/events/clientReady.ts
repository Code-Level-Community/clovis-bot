import { ChannelType, Client, REST, Routes } from 'discord.js';
import animaisNordeste from '../../animais.json';
import * as limite from '../commands/limite';
import canaisTemporarios from '../utils/canaisTemporarios';

async function registrarComandos(clientId: string, token: string): Promise<void> {
  const rest = new REST().setToken(token);
  try {
    await rest.put(Routes.applicationCommands(clientId), {
      body: [limite.data.toJSON()],
    });
    console.log('✅ Slash commands registrados!');
  } catch (err) {
    console.error('Erro ao registrar slash commands:', err);
  }
}

async function recarregarCanais(client: Client): Promise<void> {
  const nomesAnimais = new Set(animaisNordeste.map(a => a.nome));

  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (channel.type !== ChannelType.GuildVoice) continue;
      if (!nomesAnimais.has(channel.name)) continue;

      const membrosReais = channel.members.filter(m => !m.user.bot);

      if (membrosReais.size === 0) {
        try {
          await channel.delete();
          console.log(`🗑️ Canal vazio deletado no startup: ${channel.name}`);
        } catch (err) {
          console.error('Erro ao deletar canal no startup:', err);
        }
      } else {
        const dono = channel.permissionOverwrites.cache.find(
          p => p.type === 1 && p.id !== client.user!.id
        );
        canaisTemporarios.set(channel.id, dono ? dono.id : null);
        console.log(`🔄 Canal temporário recuperado: ${channel.name}`);
      }
    }
  }
}

export const name = 'clientReady';
export const once = true;

export async function execute(client: Client): Promise<void> {
  console.log(`✅ Clóvis online como ${client.user!.tag}`);
  await registrarComandos(process.env.CLIENT_ID!, process.env.DISCORD_TOKEN!);
  await recarregarCanais(client);
}