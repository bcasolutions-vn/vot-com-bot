const express = require('express');
const router = express.Router();
const supabase = require('../supabase-client');

// Get orders by date
router.get('/orders', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Calculate totals
  const totalOrders = data.length;
  const totalAmount = data.reduce((sum, o) => sum + o.price, 0);
  const paidCount = data.filter(o => o.paid).length;

  res.json({
    date,
    orders: data,
    stats: {
      totalOrders,
      totalAmount,
      paidCount,
      unpaidCount: totalOrders - paidCount
    }
  });
});

// Get debt overview
router.get('/debts', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('user_id, user_name, price')
    .eq('paid', false);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Aggregate by user
  const debtMap = {};
  data.forEach(order => {
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

  const debtList = Object.values(debtMap)
    .sort((a, b) => b.total_debt - a.total_debt);

  const totalUnpaid = debtList.reduce((sum, d) => sum + d.total_debt, 0);

  res.json({
    debts: debtList,
    totalUnpaid
  });
});

// Get user statistics
router.get('/stats', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Aggregate by user
  const statsMap = {};
  data.forEach(order => {
    if (!statsMap[order.user_id]) {
      statsMap[order.user_id] = {
        user_name: order.user_name,
        total_orders: 0,
        total_spent: 0,
        paid_orders: 0
      };
    }
    statsMap[order.user_id].total_orders++;
    statsMap[order.user_id].total_spent += order.price;
    if (order.paid) {
      statsMap[order.user_id].paid_orders++;
    }
  });

  // Calculate payment rate
  const statsList = Object.values(statsMap).map(stat => ({
    ...stat,
    avg_price: Math.round(stat.total_spent / stat.total_orders),
    payment_rate: Math.round((stat.paid_orders / stat.total_orders) * 100)
  })).sort((a, b) => b.total_spent - a.total_spent);

  res.json({ stats: statsList });
});

module.exports = router;
