const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const revolutApiKey = Deno.env.get('REVOLUT_API_SECRET_KEY')
  if (!revolutApiKey) {
    return new Response(JSON.stringify({ error: 'No API key' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // List all subscriptions
    const res = await fetch(`${REVOLUT_API_URL}/subscriptions?limit=100`, {
      headers: {
        'Authorization': `Bearer ${revolutApiKey}`,
        'Revolut-Api-Version': '2024-09-01',
      },
    })

    const body = await res.text()
    console.log('Revolut response status:', res.status)
    console.log('Revolut response:', body)

    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
