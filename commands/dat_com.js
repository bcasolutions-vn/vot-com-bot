const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports.data = new SlashCommandBuilder()
  .setName('dat_com')
  .setDescription('Tạo menu đặt cơm cho hôm nay');

module.exports.execute = async interaction => {
  const modal = new ModalBuilder()
    .setCustomId('dat_com')
    .setTitle('🍚 Tạo menu đặt cơm');

  const menuInput = new TextInputBuilder()
    .setCustomId('menu')
    .setLabel('Nhập danh sách món (mỗi món 1 dòng)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const row1 = new ActionRowBuilder().addComponents(menuInput);

  modal.addComponents(row1);

  await interaction.showModal(modal);
};
