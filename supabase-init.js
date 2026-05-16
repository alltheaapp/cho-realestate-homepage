window.SUPABASE_URL = "https://dwbkwotldcvdzcmfassa.supabase.co";
window.SUPABASE_KEY = "sb_publishable_6nugV1vM4g-D1AMPQTSPWw_6oIYdbXs";
window.initSupabase = () => {
  if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    return window.supabaseClient;
  }
  return null;
};
