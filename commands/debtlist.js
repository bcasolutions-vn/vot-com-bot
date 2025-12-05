const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../supabase-client');
const { formatVND } = require('../utils/price-extractor');

module.exports.data = new SlashCommandBuilder()
  .setName('debtlist')
  .setDescription('Xem danh sách công nợ của mọi người');

module.exports.execute = async interaction => {
  await interaction.deferReply();

  // Query: Users with unpaid orders
  const { data: debtData, error: debtError } = await supabase
    .from('orders')
    .select('user_id, user_name, price')
    .eq('paid', false);

  if (debtError) {
    console.error('❌ Debtlist query error:', debtError);
    return interaction.editReply({
      content: '❌ Lỗi truy vấn dữ liệu!'
    });
  }

  // Aggregate by user
  const debtMap = {};
  debtData.forEach(order => {
    if (!debtMap[order.user_id]) {
      debtMap[order.user_id] = {
        user_name: order.user_name,
        order_count: 0,
        total_debt: 0
      };
    }
    debtMap[order.user_id].order_count++;
    debtMap[order.user_id].total_debt += order.price;
  });

  // Convert to array and sort by debt (highest first)
  const debtList = Object.entries(debtMap)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.total_debt - a.total_debt);

  // Build embed
  const embed = new EmbedBuilder()
    .setTitle('💰 Danh Sách Công Nợ')
    .setTimestamp();

  if (debtList.length === 0) {
    embed
      .setDescription('🎉 Mọi người đều đã thanh toán! Không có công nợ.')
      .setColor(0x10b981);

    return interaction.editReply({ embeds: [embed] });
  }

  // Calculate total unpaid
  const totalUnpaid = debtList.reduce((sum, d) => sum + d.total_debt, 0);

  // Format debt list (max 25 users to fit embed limits)
  const debtLines = debtList.slice(0, 25).map(d => {
    const name = d.user_name.padEnd(15);
    const orders = `${d.order_count} món`.padEnd(8);
    const amount = formatVND(d.total_debt);
    return `${name} │ ${orders} │ ${amount}`;
  });

  let description = `📊 **Tổng công nợ:** ${formatVND(totalUnpaid)}\n\n`;
  description += '```\n';
  description += debtLines.join('\n');
  description += '\n```\n\n';
  description += '_Dùng `/debt` để xem công nợ của bạn_\n';
  description += '_Dùng `/markpaid` để đánh dấu đã thanh toán_';

  embed
    .setDescription(description)
    .setColor(0xef4444);

  await interaction.editReply({ embeds: [embed] });
};
