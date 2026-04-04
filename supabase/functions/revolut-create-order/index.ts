import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api/orders'

// Server-side allowlist of valid plans — prevents arbitrary order creation
const VALID_PLANS: Record<string, { amount: number; currency: string }> = {
  'Starter Advertiser': { amount: 79, currency: 'EUR' },
  'Growth Advertiser': { amount: 119, currency: 'EUR' },
  'Advanced Advertiser': { amount: 149, currency: 'EUR' },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Validate input ---
    const body = await req.json()
    const { planName, email } = body

    if (!planName || typeof planName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid planName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plan = VALID_PLANS[planName]
    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Unknown plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
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
      amount: plan.amount * 100,
      currency: plan.currency,
      description: `Adcure ${planName} Subscription`,
      capture_mode: 'automatic',
      merchant_order_ext_ref: `adcure_${planName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      email,
      redirect_url: `${origin}/payment-success?plan=${encodeURIComponent(planName)}&email=${encodeURIComponent(email)}`,
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

    // Store the order using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseAdmin.from('payments').insert({
      revolut_order_id: data.id,
      merchant_ref: orderPayload.merchant_order_ext_ref,
      status: 'pending',
      user_id: null,
      payload: {
        plan: planName,
        amount: plan.amount,
        currency: plan.currency,
        email,
        revolut_state: data.state,
      },
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
