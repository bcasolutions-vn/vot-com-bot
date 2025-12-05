// Cloudflare Pages Function - Get All Debts
export async function onRequest(context) {
  const { env } = context;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('paid', false)
      .order('date', { ascending: false });

    if (error) throw error;

    // Group by user
    const debts = data.reduce((acc, order) => {
      const key = order.user_id;
      if (!acc[key]) {
        acc[key] = {
          user_id: order.user_id,
          user_name: order.user_name,
          total: 0,
          orders: []
        };
      }
      acc[key].total += order.price;
      acc[key].orders.push(order);
      return acc;
    }, {});

    return new Response(JSON.stringify(Object.values(debts)), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
