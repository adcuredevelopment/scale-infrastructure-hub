const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api/orders'
// For sandbox testing, use: 'https://sandbox-merchant.revolut.com/api/orders'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planName, amount, currency, email } = await req.json()

    if (!planName || !amount || !currency) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: planName, amount, currency' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const REVOLUT_API_KEY = Deno.env.get('REVOLUT_API_SECRET_KEY')
    if (!REVOLUT_API_KEY) {
      console.error('REVOLUT_API_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const siteUrl = SUPABASE_URL.replace('.supabase.co', '.lovable.app')
      
    // Use the origin from the request or fall back
    const origin = req.headers.get('origin') || 'https://scale-infrastructure-hub.lovable.app'

    const orderPayload = {
      amount: amount * 100, // Revolut expects minor units (cents)
      currency: currency.toUpperCase(),
      description: `Adcure ${planName} Subscription`,
      capture_mode: 'automatic',
      merchant_order_ext_ref: `adcure_${planName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      email: email || undefined,
      redirect_url: `${origin}/payment-success?plan=${encodeURIComponent(planName)}`,
    }

    const response = await fetch(REVOLUT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVOLUT_API_KEY}`,
        'Content-Type': 'application/json',
        'Revolut-Api-Version': '2024-09-01',
      },
      body: JSON.stringify(orderPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Revolut API error:', JSON.stringify(data))
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return the checkout URL for redirect
    return new Response(
      JSON.stringify({
        order_id: data.id,
        checkout_url: data.checkout_url,
        state: data.state,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
