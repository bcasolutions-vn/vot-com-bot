const { Client, GatewayIntentBits, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const supabase = require('./supabase-client');
const { extractPrice } = require('./utils/price-extractor');
const express = require('express');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Express app setup
const app = express();
const PORT = process.env.PORT || 3000;

client.commands = new Collection();

// Load commands từ folder commands/
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')) : [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot đã online với tên ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Có lỗi xảy ra khi xử lý lệnh!', ephemeral: true });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'dat_com') {
    const {
      ActionRowBuilder,
      StringSelectMenuBuilder,
      EmbedBuilder,
      ComponentType
    } = require('discord.js');

    const raw = interaction.fields.getTextInputValue('menu');
    const items = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

    if (items.length === 0) return interaction.reply({ content: '❌ Không có món nào?', ephemeral: true });
    if (items.length > 40) return interaction.reply({ content: '⚠️ Tối đa 40 món ăn thôi bạn!', ephemeral: true });

    // Save menu items to database immediately
    const today = new Date().toISOString().split('T')[0];

    // Delete existing menu for today first
    await supabase.from('menus').delete().eq('date', today);

    // Insert new menu items
    const menuData = items.map(dish => ({
      date: today,
      dish_name: dish,
      price: extractPrice(dish)
    }));

    const { error: menuError } = await supabase.from('menus').insert(menuData);

    if (menuError) {
      console.error('❌ Error saving menu:', menuError);
      return interaction.reply({
        content: '❌ Lỗi khi lưu menu! Vui lòng thử lại.',
        ephemeral: true
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('vote_select')
      .setPlaceholder('Chọn món bạn muốn ăn...')
      .addOptions(
        items.map((m, i) => ({
          label: m.slice(0, 100),
          value: i.toString(),
          description: `Giá: ${extractPrice(m).toLocaleString('vi-VN')} VND`
        }))
      );

    // Extra rice toggle button shown below the select menu (shared on public message)
    const extraRiceBtn = new ButtonBuilder()
      .setCustomId('vote_extra_rice')
      .setLabel('🍚 Cơm thêm (free)')
      .setStyle(ButtonStyle.Secondary);

    const selectRow = new ActionRowBuilder().addComponents(menu);
    const btnRow = new ActionRowBuilder().addComponents(extraRiceBtn);

    const embed = new EmbedBuilder()
      .setTitle('🍚 Menu đặt cơm hôm nay')
      .setColor(0x10b981)
      .setDescription(items.map((m, i) => `**${i + 1}.** ${m}`).join('\n'))
      .setFooter({ text: 'Chọn món • Bấm "Cơm thêm" nếu muốn thêm cơm (free) • /ket-qua để xem kết quả' })
      .setTimestamp();

    const msg = await interaction.reply({
      embeds: [embed],
      components: [selectRow, btnRow],
      fetchReply: true
    });

    // Track per-user extra rice state: { userId: boolean }
    const extraRiceState = {};

    const collector = msg.createMessageComponentCollector();

    collector.on('collect', async i => {
      const userId = i.user.id;
      const userName = i.member?.displayName || i.user.username;

      if (i.customId === 'vote_select') {
        const selectedDish = items[+i.values[0]];
        const price = extractPrice(selectedDish);
        const wantsExtraRice = extraRiceState[userId] || false;

        // Delete existing orders for this user today
        await supabase.from('orders').delete().eq('date', today).eq('user_id', userId);

        // Insert order — extra_rice follows whatever user toggled
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
          console.error('❌ Error inserting order:', insertError);
          await i.reply({ content: '❌ Lỗi khi lưu đơn hàng!', ephemeral: true });
        } else {
          const extraText = wantsExtraRice ? '\n🍚 **Cơm thêm:** Có (free)' : '';
          await i.reply({
            content: `✅ Đã đặt: **${selectedDish}**\n💰 Giá: ${price.toLocaleString('vi-VN')} VND${extraText}`,
            ephemeral: true
          });
        }

      } else if (i.customId === 'vote_extra_rice') {
        // Toggle extra rice state for this user
        extraRiceState[userId] = !extraRiceState[userId];
        const isOn = extraRiceState[userId];
        await i.reply({
          content: isOn
            ? '🍚 Đã bật **Cơm thêm** — chọn món để xác nhận!'
            : '🍚 Đã tắt **Cơm thêm** — chọn món để xác nhận!',
          ephemeral: true
        });
      }
    });
  }
});

// === Web Server Setup ===

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', require('./routes/api'));

// View routes
app.get('/', (req, res) => {
  res.redirect('/orders');
});

app.get('/orders', (req, res) => {
  res.render('orders', {
    title: 'Daily Orders'
  });
});

app.get('/debts', (req, res) => {
  res.render('debts', {
    title: 'Debt Overview'
  });
});

app.get('/stats', (req, res) => {
  res.render('stats', {
    title: 'User Statistics'
  });
});

// Start web server
app.listen(PORT, () => {
  console.log(`🌐 Web server running on http://localhost:${PORT}`);
});

// === End Web Server Setup ===

client.login(process.env.TOKEN);
