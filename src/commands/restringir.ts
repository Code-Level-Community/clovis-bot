import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { restringirCanal } from '../services/restricaoService';

const CARGOS_PERMITIDOS = ['👑 Fundador / Admin', '🛡️ Moderador'];

export const data = new SlashCommandBuilder()
  .setName('restringir')
  .setDescription('Restringe o canal de voz atual a cargos específicos')
  .addRoleOption(option =>
    option.setName('cargo1').setDescription('Cargo permitido').setRequired(true)
  )
  .addRoleOption(option =>
    option.setName('cargo2').setDescription('Cargo adicional (opcional)').setRequired(false)
  )
  .addRoleOption(option =>
    option.setName('cargo3').setDescription('Cargo adicional (opcional)').setRequired(false)
  );

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

  const cargos = [
    interaction.options.getRole('cargo1'),
    interaction.options.getRole('cargo2'),
    interaction.options.getRole('cargo3'),
  ].filter(Boolean);

  await restringirCanal(interaction, member.voice.channel, cargos as any[]);
}