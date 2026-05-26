import { ChannelType, Client, PermissionFlagsBits, VoiceState } from 'discord.js';
import animaisNordeste from '../../animais.json';
import canaisTemporarios from '../utils/canaisTemporarios';

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

    console.log(`✅ Canal criado: ${animal.nome} para ${member.user.tag}`);
  } catch (err) {
    console.error('Erro ao criar canal temporário:', err);
  }
}

async function deletarCanalSeVazio(oldState: VoiceState): Promise<void> {
  const canal = oldState.channel!;
  const membrosReais = canal.members.filter(m => !m.user.bot);

  if (membrosReais.size === 0) {
    try {
      await canal.delete();
      canaisTemporarios.delete(canal.id);
      console.log(`🗑️ Canal deletado: ${canal.name}`);
    } catch (err) {
      console.error('Erro ao deletar canal:', err);
    }
  }
}

export const name = 'voiceStateUpdate';

export async function execute(oldState: VoiceState, newState: VoiceState, client: Client): Promise<void> {
  if (newState.channel?.name === CANAL_GATILHO) {
    await criarCanalTemporario(newState, client);
  }

  if (oldState.channel && canaisTemporarios.has(oldState.channel.id)) {
    await deletarCanalSeVazio(oldState);
  }
}