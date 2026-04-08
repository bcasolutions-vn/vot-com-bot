const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const supabase = require('../supabase-client');

module.exports.data = new SlashCommandBuilder()
  .setName('ket-qua')
  .setDescription('Xem kết quả đặt cơm hôm nay');

module.exports.execute = async interaction => {
  const today = new Date().toISOString().split('T')[0];

  // Get today's orders
  const { data: todayOrders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('date', today)
    .order('dish_name', { ascending: true });


  if (error) {
    return interaction.reply({
      content: '❌ Lỗi khi lấy dữ liệu!',
      ephemeral: true
    });
  }

  if (!todayOrders || todayOrders.length === 0) {
    return interaction.reply({
      content: '📭 Chưa có ai đặt cơm hôm nay!',
      ephemeral: false
    });
  }

  // Group orders by dish
  const results = todayOrders.reduce((acc, order) => {
    const dish = order.dish_name;
    if (!acc[dish]) {
      acc[dish] = {
        users: [],
        count: 0,
        totalPrice: 0
      };
    }
    acc[dish].users.push(order.user_name);
    acc[dish].count++;
    acc[dish].totalPrice += order.price || 0;
    return acc;
  }, {});

  // Sort by count (descending)
  const sorted = Object.entries(results)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([dish, data]) => ({
      dish,
      ...data
    }));

  // Calculate totals
  const totalOrders = todayOrders.length;
  const totalAmount = todayOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const uniqueDishes = sorted.length;

  // Extra rice: users who requested it
  const extraRiceOrders = todayOrders.filter(o => o.extra_rice);
  const extraRiceCount = extraRiceOrders.length;
  const extraRiceUsers = extraRiceOrders.map(o => o.user_name);

  // Create description in requested format: <count> <dish> — <users>
  const description = sorted
    .map(item => {
      const userList = item.users.join(', ');
      return `${item.count}  ${item.dish} — ${userList}`;
    })
    .join('\n');

  const fields = [
    {
      name: '📊 Tổng quan',
      value: `**Tổng đơn:** ${totalOrders}\n` +
             `**Số món:** ${uniqueDishes}\n` +
             `**Tổng tiền:** ${totalAmount.toLocaleString('vi-VN')} VND`,
      inline: false
    }
  ];

  if (extraRiceCount > 0) {
    fields.push({
      name: `🍚 Cơm thêm (free) — ${extraRiceCount} phần`,
      value: extraRiceUsers.join(', '),
      inline: false
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🍽️ Kết quả đặt cơm hôm nay')
    .setColor(0xFFA500)
    .setDescription(description || 'Không có đơn hàng nào')
    .addFields(...fields)
    .setFooter({
      text: `Ngày ${new Date().toLocaleDateString('vi-VN')}`
    })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed]
  });
};
