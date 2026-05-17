export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  // CORS 헤더
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = 'https://dwbkwotldcvdzcmfassa.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6nugV1vM4g-D1AMPQTSPWw_6oIYdbXs';

  try {
    if (method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
        headers: { 'apikey': SUPABASE_KEY }
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const item = await request.json();

      // DELETE 후 INSERT
      await fetch(`${SUPABASE_URL}/rest/v1/site_content?key=eq.${encodeURIComponent(item.key)}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY }
      });

      const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: response.statusText }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
