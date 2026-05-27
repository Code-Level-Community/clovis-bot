import { ChannelType, Client, GuildMember, PermissionFlagsBits, VoiceState } from 'discord.js';
import animaisNordeste from '../../animais.json';
import { getRestricoes } from '../services/restricaoService';
import canaisTemporarios from '../utils/canaisTemporarios';
import { logger } from '../utils/logger';

const CANAL_GATILHO = '➕ Criar canal de voz';

async function criarCanalTemporario(newState: VoiceState, client: Client): Promise<void> {
  const guild = newState.guild;
  const member = newState.member!;
  const animal = animaisNordeste[Math.floor(Math.random() * animaisNordeste.length)];

  try {
    const novoCanal = await guild.channels.create({
      name: animal.nome,
      type: ChannelType.GuildVoice,
      parent: newState.channel!.parentId,
      userLimit: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.ManageChannels],
        },
        {
          id: member.id,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.ManageChannels],
        },
        {
          id: client.user!.id,
          allow: [
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    });

    canaisTemporarios.set(novoCanal.id, member.id);
    await member.voice.setChannel(novoCanal);
    await novoCanal.send(
      `👋 Bem-vindo ao canal **${animal.nome}**!\n📖 Saiba mais sobre esse animal: ${animal.wiki}\n\n💡 Use **/limite** para definir o número máximo de usuários no canal.`
    );

    logger.info({ canal: animal.nome, usuario: member.user.tag }, 'Canal temporário criado');
  } catch (err) {
    logger.error({ err, usuario: member.user.tag }, 'Erro ao criar canal temporário');
  }
}

async function deletarCanalSeVazio(oldState: VoiceState): Promise<void> {
  const canal = oldState.channel!;
  const membrosReais = canal.members.filter(m => !m.user.bot);

  if (membrosReais.size === 0) {
    try {
      await canal.delete();
      canaisTemporarios.delete(canal.id);
      logger.info({ canal: canal.name }, 'Canal temporário deletado');
    } catch (err) {
      logger.error({ err, canal: canal.name }, 'Erro ao deletar canal temporário');
    }
  }
}

export const name = 'voiceStateUpdate';

export async function execute(oldState: VoiceState, newState: VoiceState, client: Client): Promise<void> {
  if (newState.channel?.name === CANAL_GATILHO) {
    await criarCanalTemporario(newState, client);
  }

  const restricoes = getRestricoes();

  if (newState.channel && restricoes.has(newState.channel.id)) {
    const cargosPermitidos = restricoes.get(newState.channel.id)!;
    const member = newState.member as GuildMember;

    if (!member.user.bot && !cargosPermitidos.has('')) {
      const temCargo = [...cargosPermitidos].some(id => member.roles.cache.has(id));
      if (!temCargo) {
        try {
          await member.voice.disconnect();
          logger.warn({ usuario: member.user.tag, canal: newState.channel!.name }, 'Membro removido por não ter o cargo necessário');
        } catch (err) {
          logger.error({ err, usuario: member.user.tag }, 'Erro ao expulsar membro sem cargo');
        }
      }
    }
  }

  if (oldState.channel && canaisTemporarios.has(oldState.channel.id)) {
    await deletarCanalSeVazio(oldState);
  }
}