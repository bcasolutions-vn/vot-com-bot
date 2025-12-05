const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ComponentType
} = require('discord.js');
const supabase = require('../supabase-client');
const { extractPrice } = require('../utils/price-extractor');

module.exports.data = new SlashCommandBuilder()
  .setName('com-them')
  .setDescription('Đặt thêm món từ menu hôm nay');

module.exports.execute = async interaction => {
  const today = new Date().toISOString().split('T')[0];

  // Get today's menu from menus table
  const { data: todayMenu, error } = await supabase
    .from('menus')
    .select('dish_name, price')
    .eq('date', today)
    .order('dish_name', { ascending: true });

  if (error) {
    return interaction.reply({
      content: '❌ Lỗi khi lấy menu hôm nay!',
      ephemeral: true
    });
  }

  if (!todayMenu || todayMenu.length === 0) {
    return interaction.reply({
      content: '❌ Chưa có menu nào hôm nay! Hãy sử dụng `/dat_com` để tạo menu.',
      ephemeral: true
    });
  }

  // Get unique dishes
  const uniqueDishes = todayMenu.map(m => m.dish_name);

  // Check if user already ordered today
  const userId = interaction.user.id;
  const { data: existingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('date', today)
    .eq('user_id', userId);

  let headerText = '🍚 Chọn món ăn';
  if (existingOrders && existingOrders.length > 0) {
    const currentDishes = existingOrders.map(o => o.dish_name).join(', ');
    headerText = `🔄 Bạn đã đặt: **${currentDishes}**\n\nChọn món khác để thay đổi:`;
  }

  // Create select menu with unique dishes
  const menu = new StringSelectMenuBuilder()
    .setCustomId('reorder_select')
    .setPlaceholder('Chọn món bạn muốn ăn...')
    .addOptions(
      uniqueDishes.slice(0, 25).map((dish, i) => ({
        label: dish.slice(0, 100),
        value: i.toString(),
        description: `Giá: ${todayMenu[i].price.toLocaleString('vi-VN')} VND`
      }))
    );

  const row = new ActionRowBuilder().addComponents(menu);

  const embed = new EmbedBuilder()
    .setTitle('🍽️ Menu hôm nay')
    .setColor(0x10b981)
    .setDescription(
      headerText + '\n\n' +
      uniqueDishes.map((m, i) => `**${i + 1}.** ${m}`).join('\n')
    )
    .setFooter({ text: 'Chọn món từ menu bên dưới' })
    .setTimestamp();

  const msg = await interaction.reply({
    embeds: [embed],
    components: [row],
    fetchReply: true,
    ephemeral: true
  });

  // Create collector for user selection
  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60_000, // 1 minute to select
    filter: i => i.user.id === interaction.user.id
  });

  collector.on('collect', async i => {
    const selectedIndex = +i.values[0];
    const selectedDish = uniqueDishes[selectedIndex];
    const userName = i.member?.displayName || i.user.username;
    const price = todayMenu[selectedIndex].price;

    // Delete existing orders for this user today
    await supabase
      .from('orders')
      .delete()
      .eq('date', today)
      .eq('user_id', userId);

    // Insert new order
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        date: today,
        user_id: userId,
        user_name: userName,
        dish_name: selectedDish,
        price: price,
        paid: false
      });

    if (insertError) {
      await i.update({
        content: '❌ Lỗi khi lưu đơn hàng!',
        embeds: [],
        components: []
      });
    } else {
      await i.update({
        content: `✅ Đã cập nhật đơn hàng!\n\n**Món ăn:** ${selectedDish}\n**Giá:** ${price.toLocaleString('vi-VN')} VND`,
        embeds: [],
        components: []
      });
    }

    collector.stop();
  });

  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      await interaction.editReply({
        content: '⏱️ Hết thời gian chọn món!',
        embeds: [],
        components: []
      });
    }
  });
};
