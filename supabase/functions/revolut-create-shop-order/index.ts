import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api/orders'

// Server-side allowlist of all shop products (excl. BTW, EUR)
const VALID_PRODUCTS: Record<string, { amount: number; currency: string; category: string }> = {
  // Facebook Accounts
  'Facebook Vietnamese 3Line Account': { amount: 30, currency: 'EUR', category: 'facebook-accounts' },
  'Facebook Vietnamese Super Aged (2007–2015) 3Line Account': { amount: 35, currency: 'EUR', category: 'facebook-accounts' },
  'Facebook US 3Line Reinstated Account': { amount: 40, currency: 'EUR', category: 'facebook-accounts' },
  'Facebook US 3Line 2x Reinstated Account': { amount: 60, currency: 'EUR', category: 'facebook-accounts' },
  // Facebook Pages
  'Facebook Page — No Followers': { amount: 7.5, currency: 'EUR', category: 'facebook-pages' },
  'Facebook Page — 800–1,500 Followers': { amount: 20, currency: 'EUR', category: 'facebook-pages' },
  'Facebook Page — 2,000–4,000 Followers': { amount: 30, currency: 'EUR', category: 'facebook-pages' },
  'Facebook Page — 10K+ Followers': { amount: 80, currency: 'EUR', category: 'facebook-pages' },
  // Facebook Structures
  'Facebook Structure — Starter': { amount: 175, currency: 'EUR', category: 'facebook-structures' },
  'Facebook Structure — Pro': { amount: 225, currency: 'EUR', category: 'facebook-structures' },
  // Business Managers
  'Verified Old Business Manager BM350 Limit $25': { amount: 95, currency: 'EUR', category: 'business-managers' },
  'Verified Old Business Manager BM350 Limit $50': { amount: 115, currency: 'EUR', category: 'business-managers' },
  'Reinstated Business Manager BM350 Limit $250': { amount: 250, currency: 'EUR', category: 'business-managers' },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { productName, email, firstName, lastName, country, affiliateCode } = body

    if (!productName || typeof productName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid productName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const product = VALID_PRODUCTS[productName]
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Unknown product' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!firstName || typeof firstName !== 'string' || !lastName || typeof lastName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'First and last name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!country || typeof country !== 'string' || country.length > 5) {
      return new Response(
        JSON.stringify({ error: 'Valid country is required' }),
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

    // Server-side BTW calculation (21% for NL only)
    const subtotal = product.amount
    const isNL = country === 'NL'
    const vatRate = isNL ? 0.21 : 0
    const vatAmount = +(subtotal * vatRate).toFixed(2)
    const total = +(subtotal + vatAmount).toFixed(2)

    const origin = req.headers.get('origin') || 'https://scale-infrastructure-hub.lovable.app'
    const merchantRef = `adcure_shop_${product.category}_${Date.now()}`

    const orderPayload = {
      amount: Math.round(total * 100), // in cents
      currency: product.currency,
      description: `Adcure Shop — ${productName}`,
      capture_mode: 'automatic',
      merchant_order_ext_ref: merchantRef,
      email,
      redirect_url: `${origin}/payment-success?product=${encodeURIComponent(productName)}&email=${encodeURIComponent(email)}`,
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseAdmin.from('payments').insert({
      revolut_order_id: data.id,
      merchant_ref: merchantRef,
      status: 'pending',
      user_id: null,
      payload: {
        type: 'shop_order',
        product: productName,
        category: product.category,
        amount: subtotal,
        vat: vatAmount,
        total,
        currency: product.currency,
        email,
        firstName,
        lastName,
        country,
        revolut_state: data.state,
        affiliateCode: (typeof affiliateCode === 'string' && affiliateCode.length <= 20) ? affiliateCode : null,
      },
    })

    return new Response(
      JSON.stringify({
        order_id: data.id,
        checkout_url: data.checkout_url,
        state: data.state,
        breakdown: { subtotal, vat: vatAmount, total },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating shop order:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
