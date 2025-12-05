// Cloudflare Pages Function - Get User Statistics
export async function onRequest(context) {
  const { env } = context;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats per user
    const stats = data.reduce((acc, order) => {
      const key = order.user_id;
      if (!acc[key]) {
        acc[key] = {
          user_id: order.user_id,
          user_name: order.user_name,
          total_orders: 0,
          total_spent: 0,
          unpaid_count: 0,
          unpaid_amount: 0
        };
      }
      acc[key].total_orders++;
      acc[key].total_spent += order.price;
      if (!order.paid) {
        acc[key].unpaid_count++;
        acc[key].unpaid_amount += order.price;
      }
      return acc;
    }, {});

    return new Response(JSON.stringify(Object.values(stats)), {
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
