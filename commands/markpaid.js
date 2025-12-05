const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const supabase = require('../supabase-client');
const { formatVND } = require('../utils/price-extractor');

module.exports.data = new SlashCommandBuilder()
  .setName('markpaid')
  .setDescription('Đánh dấu bạn đã thanh toán');

module.exports.execute = async interaction => {
  await interaction.deferReply({ ephemeral: true });

  // Query unpaid orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', interaction.user.id)
    .eq('paid', false);

  if (error) {
    return interaction.editReply({
      content: '❌ Lỗi truy vấn dữ liệu!'
    });
  }

  if (orders.length === 0) {
    return interaction.editReply({
      content: '✅ Bạn không có công nợ cần thanh toán!'
    });
  }

  const totalDebt = orders.reduce((sum, o) => sum + o.price, 0);

  // Build buttons
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pay_all')
      .setLabel(`Thanh toán tất cả (${formatVND(totalDebt)})`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Hủy')
      .setStyle(ButtonStyle.Secondary)
  );

  const embed = new EmbedBuilder()
    .setTitle('💰 Xác Nhận Thanh Toán')
    .setDescription(
      `Bạn có **${orders.length} đơn** chưa thanh toán.\n` +
      `Tổng: **${formatVND(totalDebt)}**\n\n` +
      `Xác nhận đã thanh toán?`
    )
    .setColor(0x3b82f6);

  const response = await interaction.editReply({
    embeds: [embed],
    components: [row]
  });

  // Button collector
  const collector = response.createMessageComponentCollector({
    time: 60000 // 1 minute
  });

  collector.on('collect', async i => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: '❌ Chỉ người gọi lệnh mới được chọn!',
        ephemeral: true
      });
    }

    if (i.customId === 'cancel') {
      await i.update({
        content: '❌ Đã hủy.',
        embeds: [],
        components: []
      });
      collector.stop();
      return;
    }

    if (i.customId === 'pay_all') {
      // Update all unpaid orders to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ paid: true })
        .eq('user_id', interaction.user.id)
        .eq('paid', false);

      if (updateError) {
        await i.update({
          content: '❌ Lỗi cập nhật! Vui lòng thử lại.',
          embeds: [],
          components: []
        });
        collector.stop();
        return;
      }

      await i.update({
        content: `✅ Đã đánh dấu **${orders.length} đơn** là đã thanh toán (${formatVND(totalDebt)})!\n\n_Cảm ơn bạn!_ 🙏`,
        embeds: [],
        components: []
      });

      collector.stop();
    }
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.editReply({
        content: '⏱ Hết thời gian. Vui lòng chạy lại lệnh.',
        embeds: [],
        components: []
      });
    }
  });
};
