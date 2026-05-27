import { ChatInputCommandInteraction, GuildMember, Role, VoiceBasedChannel } from 'discord.js';
import canaisTemporarios from '../utils/canaisTemporarios';
import { logger } from '../utils/logger';

// canalId -> Set de cargo IDs permitidos
const restricoes = new Map<string, Set<string>>();

export function getRestricoes(): Map<string, Set<string>> {
  return restricoes;
}

export async function restringirCanal(
  interaction: ChatInputCommandInteraction,
  canal: VoiceBasedChannel,
  cargos: Role[]
): Promise<void> {
  if (!canaisTemporarios.has(canal.id)) {
    await interaction.reply({
      content: '❌ Só é possível restringir canais de voz temporários.',
      ephemeral: true,
    });
    return;
  }

  const cargoIds = new Set(cargos.map(c => c.id));
  restricoes.set(canal.id, cargoIds);

  const nomesCargos = cargos.map(c => `<@&${c.id}>`).join(', ');

  await interaction.reply({
    content: `⚠️ Em 1 minuto apenas ${nomesCargos} poderão estar neste canal. Membros sem esses cargos serão removidos.`,
  });

  // Expulsa imediatamente quem entrar sem o cargo durante o timer
  // (tratado no voiceStateUpdate)

  // Após 1 minuto, expulsa quem não tem o cargo
  setTimeout(async () => {
    if (!restricoes.has(canal.id)) return; // foi liberado antes do timer

    const membrosParaExpulsar = canal.members.filter((m: GuildMember) => {
      if (m.user.bot) return false;
      return !cargos.some(cargo => m.roles.cache.has(cargo.id));
    });

    for (const membro of membrosParaExpulsar.values()) {
      try {
        await membro.voice.disconnect();
      } catch (err) {
        logger.error({ err, usuario: membro.user.tag }, 'Erro ao expulsar membro após timer de restrição');
      }
    }

    try {
      if (membrosParaExpulsar.size > 0 && canal.guild.channels.cache.has(canal.id)) {
        await canal.send(`🔒 ${membrosParaExpulsar.size} membro(s) removido(s) por não terem os cargos necessários.`);
      }
    } catch (err) {
      logger.warn({ err, canal: canal.id }, 'Canal deletado antes de enviar mensagem de restrição');
    }
  }, 60_000);
}

export async function liberarCanal(
  interaction: ChatInputCommandInteraction,
  canal: VoiceBasedChannel
): Promise<void> {
  if (!restricoes.has(canal.id)) {
    await interaction.reply({
      content: '❌ Este canal não possui restrições ativas.',
      ephemeral: true,
    });
    return;
  }

  restricoes.delete(canal.id);

  await interaction.reply({
    content: '✅ Canal liberado! Qualquer pessoa pode entrar agora.',
  });
}