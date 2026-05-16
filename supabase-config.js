const SUPABASE_URL = "https://dwbkwotldcvdzcmfassa.supabase.co";
const SUPABASE_KEY = "sb_publishable_6nugV1vM4g-D1AMPQTSPWw_6oIYdbXs";

// window.supabase가 로드될 때까지 대기
async function initSupabase() {
  if (!window.supabase) {
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (window.supabase) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    });
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

window.supabaseClient = initSupabase().then(client => {
  window.supabaseReady = true;
  return client;
});
