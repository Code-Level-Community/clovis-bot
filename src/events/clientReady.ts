import { ChannelType, Client, REST, Routes } from 'discord.js';
import animaisNordeste from '../../animais.json';
import * as liberar from '../commands/liberar';
import * as limite from '../commands/limite';
import * as restringir from '../commands/restringir';
import canaisTemporarios from '../utils/canaisTemporarios';
import { logger } from '../utils/logger';

async function registrarComandos(clientId: string, token: string): Promise<void> {
  const rest = new REST().setToken(token);
  try {
    await rest.put(Routes.applicationCommands(clientId), {
      body: [limite.data.toJSON(), restringir.data.toJSON(), liberar.data.toJSON()],
    });
    logger.info('Slash commands registrados');
  } catch (err) {
    logger.error({ err }, 'Erro ao registrar slash commands');
  }
}

async function recarregarCanais(client: Client): Promise<void> {
  const nomesAnimais = new Set(animaisNordeste.map((a: { nome: string }) => a.nome));

  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (channel.type !== ChannelType.GuildVoice) continue;
      if (!nomesAnimais.has(channel.name)) continue;

      const membrosReais = channel.members.filter(m => !m.user.bot);

      if (membrosReais.size === 0) {
        try {
          await channel.delete();
          logger.info({ canal: channel.name }, 'Canal vazio deletado no startup');
        } catch (err) {
          logger.error({ err, canal: channel.name }, 'Erro ao deletar canal no startup');
        }
      } else {
        const dono = channel.permissionOverwrites.cache.find(
          p => p.type === 1 && p.id !== client.user!.id
        );
        canaisTemporarios.set(channel.id, dono ? dono.id : null);
        logger.info({ canal: channel.name }, 'Canal temporário recuperado no startup');
      }
    }
  }
}

export const name = 'clientReady';
export const once = true;

export async function execute(client: Client): Promise<void> {
  logger.info({ tag: client.user!.tag }, 'Clóvis online');
  await registrarComandos(process.env.CLIENT_ID!, process.env.DISCORD_TOKEN!);
  await recarregarCanais(client);
}