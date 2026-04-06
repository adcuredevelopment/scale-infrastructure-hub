import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api'

// Plan variation IDs from Revolut (created via revolut-setup-plans)
// Each plan has 2 variations: [0] = excl. tax, [1] = incl. 21% BTW (NL)
const PLAN_VARIATIONS: Record<string, { base: string; nl: string; baseAmount: number; nlAmount: number }> = {
  'Starter Advertiser': {
    base: '032a9a70-c361-4b9b-852b-3a1e01728a17',
    nl: '1cffd157-9cc8-4378-9b75-1fbc603f0005',
    baseAmount: 79,
    nlAmount: 95.59,
  },
  'Growth Advertiser': {
    base: '6ca0f961-38a0-463b-ae9a-74393099ec1e',
    nl: '91afd59b-2999-4ff1-9b86-13940a39c8b3',
    baseAmount: 119,
    nlAmount: 143.99,
  },
  'Advanced Advertiser': {
    base: '317944b3-7523-4f95-a8cd-9a1fb6c8105a',
    nl: 'b002674a-b7c4-48ee-b471-93f2f353bbb2',
    baseAmount: 149,
    nlAmount: 180.29,
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { planName, email, firstName, lastName, country, affiliateCode } = body

    // Validate inputs
    if (!planName || !PLAN_VARIATIONS[planName]) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'First name is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Last name is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const REVOLUT_API_KEY = Deno.env.get('REVOLUT_API_SECRET_KEY')
    if (!REVOLUT_API_KEY) {
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const isNL = country === 'NL'
    const plan = PLAN_VARIATIONS[planName]
    const variationId = isNL ? plan.nl : plan.base
    const amount = isNL ? plan.nlAmount : plan.baseAmount

    const origin = req.headers.get('origin') || 'https://scale-infrastructure-hub.lovable.app'

    // Step 1: Create or find customer in Revolut
    const customerRes = await fetch(`${REVOLUT_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVOLUT_API_KEY}`,
        'Content-Type': 'application/json',
        'Revolut-Api-Version': '2024-09-01',
      },
      body: JSON.stringify({
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
      }),
    })

    const customerData = await customerRes.json()

    if (!customerRes.ok) {
      console.error('Failed to create customer:', JSON.stringify(customerData))
      return new Response(JSON.stringify({ error: 'Failed to create customer' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const customerId = customerData.id
    console.log('Created/found customer:', customerId)

    // Step 2: Create subscription
    const subscriptionRes = await fetch(`${REVOLUT_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVOLUT_API_KEY}`,
        'Content-Type': 'application/json',
        'Revolut-Api-Version': '2024-09-01',
      },
      body: JSON.stringify({
        customer_id: customerId,
        plan_variation_id: variationId,
        setup_order_redirect_url: `${origin}/payment-success?plan=${encodeURIComponent(planName)}&email=${encodeURIComponent(email)}`,
      }),
    })

    const subscriptionData = await subscriptionRes.json()

    if (!subscriptionRes.ok) {
      console.error('Failed to create subscription:', JSON.stringify(subscriptionData))
      return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Created subscription:', JSON.stringify(subscriptionData))

    // Step 3: Get the setup order checkout URL
    const setupOrderId = subscriptionData.setup_order_id
    if (!setupOrderId) {
      console.error('No setup_order_id in subscription response')
      return new Response(JSON.stringify({ error: 'No setup order created' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch the setup order to get checkout URL
    const orderRes = await fetch(`${REVOLUT_API_URL}/orders/${setupOrderId}`, {
      headers: {
        'Authorization': `Bearer ${REVOLUT_API_KEY}`,
        'Revolut-Api-Version': '2024-09-01',
      },
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      console.error('Failed to get setup order:', JSON.stringify(orderData))
      return new Response(JSON.stringify({ error: 'Failed to get checkout URL' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Step 4: Store in database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabaseAdmin.from('payments').insert({
      revolut_order_id: setupOrderId,
      merchant_ref: `adcure_sub_${planName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      status: 'pending',
      user_id: null,
      payload: {
        plan: planName,
        amount,
        currency: 'EUR',
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country || null,
        isSubscription: true,
        subscriptionId: subscriptionData.id,
        revolutCustomerId: customerId,
        affiliateCode: (typeof affiliateCode === 'string' && affiliateCode.length <= 20) ? affiliateCode : null,
        taxIncluded: isNL,
        taxRate: isNL ? 0.21 : 0,
      },
    })

    return new Response(JSON.stringify({
      order_id: setupOrderId,
      subscription_id: subscriptionData.id,
      checkout_url: orderData.checkout_url,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
