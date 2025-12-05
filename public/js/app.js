// Initialize Supabase client with config from layout
const supabase = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.key
);

// Subscribe to real-time changes
supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders'
    },
    (payload) => {
      console.log('Order change detected:', payload);

      // Refresh current page
      if (window.location.pathname === '/orders' && typeof loadOrders === 'function') {
        const date = document.getElementById('datePicker')?.value;
        if (date) loadOrders(date);
      }

      if (window.location.pathname === '/debts' && typeof loadDebts === 'function') {
        loadDebts();
      }

      if (window.location.pathname === '/stats' && typeof loadStats === 'function') {
        loadStats();
      }
    }
  )
  .subscribe();

console.log('✅ Realtime subscription active');
