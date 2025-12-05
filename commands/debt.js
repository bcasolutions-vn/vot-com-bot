const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../supabase-client');
const { formatVND } = require('../utils/price-extractor');

module.exports.data = new SlashCommandBuilder()
  .setName('debt')
  .setDescription('Kiểm tra công nợ của bạn');

module.exports.execute = async interaction => {
  await interaction.deferReply({ ephemeral: true });

  // Query unpaid orders for this user
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', interaction.user.id)
    .eq('paid', false)
    .order('date', { ascending: false });

  if (error) {
    console.error('❌ Debt query error:', error);
    return interaction.editReply({
      content: '❌ Lỗi truy vấn dữ liệu! Vui lòng thử lại sau.'
    });
  }

  // No debt
  if (orders.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle('📊 Công Nợ Của Bạn')
      .setDescription('✅ Bạn không có công nợ! Chúc mừng! 🎉')
      .setColor(0x10b981)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }

  // Calculate total debt
  const totalDebt = orders.reduce((sum, order) => sum + order.price, 0);

  // Build order list
  const orderList = orders.map(order => {
    return `**${order.date}:** ${order.dish_name} - ${formatVND(order.price)}`;
  }).join('\n');

  // Build embed
  const embed = new EmbedBuilder()
    .setTitle('📊 Công Nợ Của Bạn')
    .setColor(0xef4444)
    .setDescription(
      `**Tổng công nợ:** ${formatVND(totalDebt)}\n\n` +
      `**Chi tiết:**\n${orderList}\n\n` +
      `_Dùng \`/markpaid\` để đánh dấu đã thanh toán_`
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};
