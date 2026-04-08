const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
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
    return interaction.reply({ content: '❌ Lỗi khi lấy menu hôm nay!', ephemeral: true });
  }

  if (!todayMenu || todayMenu.length === 0) {
    return interaction.reply({
      content: '❌ Chưa có menu nào hôm nay! Hãy sử dụng `/dat_com` để tạo menu.',
      ephemeral: true
    });
  }

  const uniqueDishes = todayMenu.map(m => m.dish_name);
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

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('reorder_select')
    .setPlaceholder('Chọn món bạn muốn ăn...')
    .addOptions(
      uniqueDishes.slice(0, 25).map((dish, i) => ({
        label: dish.slice(0, 100),
        value: i.toString(),
        description: `Giá: ${todayMenu[i].price.toLocaleString('vi-VN')} VND`
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const embed = new EmbedBuilder()
    .setTitle('🍽️ Menu hôm nay')
    .setColor(0x10b981)
    .setDescription(headerText + '\n\n' + uniqueDishes.map((m, i) => `**${i + 1}.** ${m}`).join('\n'))
    .setFooter({ text: 'Chọn món từ menu bên dưới' })
    .setTimestamp();

  const { resource: { message: msg } } = await interaction.reply({
    embeds: [embed],
    components: [row],
    withResponse: true,
    flags: ['Ephemeral']
  });

  // Step 1: collect dish selection
  const selectCollector = msg.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60_000,
    filter: i => i.user.id === interaction.user.id
  });

  selectCollector.on('collect', async i => {
    const selectedIndex = +i.values[0];
    const selectedDish = uniqueDishes[selectedIndex];
    const price = todayMenu[selectedIndex].price;

    // Step 2: show extra rice checkbox (toggle button)
    const extraRiceBtn = new ButtonBuilder()
      .setCustomId('extra_rice_toggle')
      .setLabel('🍚 Cơm thêm (free) — Chưa chọn')
      .setStyle(ButtonStyle.Secondary);

    const confirmBtn = new ButtonBuilder()
      .setCustomId('confirm_order')
      .setLabel('✅ Xác nhận')
      .setStyle(ButtonStyle.Success);

    const btnRow = new ActionRowBuilder().addComponents(extraRiceBtn, confirmBtn);

    await i.update({
      content: `**Món đã chọn:** ${selectedDish}\n**Giá:** ${price.toLocaleString('vi-VN')} VND\n\n👇 Muốn cơm thêm không? (free)`,
      embeds: [],
      components: [btnRow]
    });

    selectCollector.stop('dish_selected');

    // Step 3: collect button interactions
    let wantsExtraRice = false;

    const btnCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
      filter: b => b.user.id === interaction.user.id
    });

    btnCollector.on('collect', async b => {
      if (b.customId === 'extra_rice_toggle') {
        wantsExtraRice = !wantsExtraRice;
        const updatedExtraBtn = new ButtonBuilder()
          .setCustomId('extra_rice_toggle')
          .setLabel(wantsExtraRice ? '🍚 Cơm thêm (free) — ✅ Đã chọn' : '🍚 Cơm thêm (free) — Chưa chọn')
          .setStyle(wantsExtraRice ? ButtonStyle.Primary : ButtonStyle.Secondary);

        await b.update({
          components: [new ActionRowBuilder().addComponents(updatedExtraBtn, confirmBtn)]
        });
      } else if (b.customId === 'confirm_order') {
        const userName = b.member?.displayName || b.user.username;

        // Delete existing orders for this user today
        await supabase.from('orders').delete().eq('date', today).eq('user_id', userId);

        // Insert new order with extra_rice flag
        const { error: insertError } = await supabase.from('orders').insert({
          date: today,
          user_id: userId,
          user_name: userName,
          dish_name: selectedDish,
          price: price,
          paid: false,
          extra_rice: wantsExtraRice
        });

        if (insertError) {
          await b.update({ content: '❌ Lỗi khi lưu đơn hàng!', components: [] });
        } else {
          const extraText = wantsExtraRice ? '\n🍚 **Cơm thêm:** Có (free)' : '';
          await b.update({
            content: `✅ Đã cập nhật đơn hàng!\n\n**Món ăn:** ${selectedDish}\n**Giá:** ${price.toLocaleString('vi-VN')} VND${extraText}`,
            components: []
          });
        }

        btnCollector.stop();
      }
    });

    btnCollector.on('end', async (collected, reason) => {
      if (reason !== 'user' && collected.size === 0) {
        await interaction.editReply({ content: '⏱️ Hết thời gian xác nhận!', components: [] });
      }
    });
  });

  selectCollector.on('end', async (collected, reason) => {
    if (reason !== 'dish_selected' && collected.size === 0) {
      await interaction.editReply({
        content: '⏱️ Hết thời gian chọn món!',
        embeds: [],
        components: []
      });
    }
  });
};
