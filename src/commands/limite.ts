import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import canaisTemporarios from '../utils/canaisTemporarios';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('limite')
  .setDescription('Define o limite de usuários do seu canal de voz temporário')
  .addIntegerOption(option =>
    option
      .setName('quantidade')
      .setDescription('Número máximo de usuários (0 = sem limite)')
      .setMinValue(0)
      .setMaxValue(99)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const member = interaction.member;

  if (!member || !('voice' in member) || !member.voice.channel) {
    await interaction.reply({
      content: '❌ Você precisa estar em um canal de voz para usar esse comando.',
      ephemeral: true,
    });
    return;
  }

  const canalAtual = member.voice.channel;

  if (canaisTemporarios.get(canalAtual.id) !== member.id) {
    await interaction.reply({
      content: '❌ Você só pode definir o limite do canal que você criou.',
      ephemeral: true,
    });
    return;
  }

  const quantidade = interaction.options.getInteger('quantidade', true);

  try {
    await canalAtual.setUserLimit(quantidade);
    const msg = quantidade === 0
      ? '✅ Limite removido! O canal agora é aberto para todos.'
      : `✅ Limite definido para **${quantidade} usuários**!`;
    await interaction.reply({ content: msg, ephemeral: true });
  } catch (err) {
    logger.error({ err, canal: canalAtual.name, limite: quantidade }, 'Erro ao definir limite do canal');
    await interaction.reply({
      content: '❌ Erro ao definir o limite. Tente novamente.',
      ephemeral: true,
    });
  }
}