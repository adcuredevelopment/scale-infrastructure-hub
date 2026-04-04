import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api/orders'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Authenticate the caller ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

    // --- Validate input ---
    const body = await req.json()
    const { planName, amount, currency, email } = body

    if (!planName || typeof planName !== 'string' || planName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid planName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validCurrencies = ['EUR', 'USD', 'GBP']
    if (!currency || !validCurrencies.includes(currency.toUpperCase())) {
      return new Response(
        JSON.stringify({ error: 'Invalid currency' }),
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

    const origin = req.headers.get('origin') || 'https://scale-infrastructure-hub.lovable.app'

    const orderPayload = {
      amount: amount * 100,
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
        JSON.stringify({ error: 'Failed to create order' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store the order with user_id using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseAdmin.from('payments').insert({
      revolut_order_id: data.id,
      merchant_ref: orderPayload.merchant_order_ext_ref,
      status: 'pending',
      user_id: userId,
      payload: { plan: planName, amount, currency },
    })

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
