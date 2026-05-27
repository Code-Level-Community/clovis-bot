import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { liberarCanal } from '../services/restricaoService';

const CARGOS_PERMITIDOS = ['👑 Fundador / Admin', '🛡️ Moderador'];

export const data = new SlashCommandBuilder()
  .setName('liberar')
  .setDescription('Remove a restrição de cargos do canal de voz atual');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const member = interaction.member as GuildMember;

  const temPermissao = CARGOS_PERMITIDOS.some(nome =>
    member.roles.cache.some(r => r.name === nome)
  );

  if (!temPermissao) {
    await interaction.reply({
      content: '❌ Você não tem permissão para usar esse comando.',
      ephemeral: true,
    });
    return;
  }

  if (!member.voice.channel) {
    await interaction.reply({
      content: '❌ Você precisa estar em um canal de voz para usar esse comando.',
      ephemeral: true,
    });
    return;
  }

  await liberarCanal(interaction, member.voice.channel);
}