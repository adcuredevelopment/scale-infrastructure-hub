import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REVOLUT_API_URL = 'https://merchant.revolut.com/api'

const PLANS = [
  {
    name: 'Starter Advertiser',
    baseAmount: 79_00, // cents
    taxAmount: 16_59, // 21% of 79
    currency: 'EUR',
  },
  {
    name: 'Growth Advertiser',
    baseAmount: 119_00,
    taxAmount: 24_99, // 21% of 119
    currency: 'EUR',
  },
  {
    name: 'Advanced Advertiser',
    baseAmount: 149_00,
    taxAmount: 31_29, // 21% of 149
    currency: 'EUR',
  },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth check - admin only
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const REVOLUT_API_KEY = Deno.env.get('REVOLUT_API_SECRET_KEY')!
    const results: any[] = []

    for (const plan of PLANS) {
      // Create plan with 2 variations: base price and NL price (with tax)
      const planPayload = {
        name: `Adcure ${plan.name}`,
        description: `Adcure ${plan.name} Monthly Subscription`,
        variations: [
          {
            name: `${plan.name} (excl. tax)`,
            phases: [
              {
                ordinal: 1,
                billing_period: 'P1M',
                amount: plan.baseAmount,
                currency: plan.currency,
              }
            ]
          },
          {
            name: `${plan.name} (incl. 21% BTW)`,
            phases: [
              {
                ordinal: 1,
                billing_period: 'P1M',
                amount: plan.baseAmount + plan.taxAmount,
                currency: plan.currency,
              }
            ]
          }
        ]
      }

      console.log(`Creating plan: ${plan.name}`, JSON.stringify(planPayload))

      const res = await fetch(`${REVOLUT_API_URL}/subscription-plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REVOLUT_API_KEY}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2024-09-01',
        },
        body: JSON.stringify(planPayload),
      })

      const data = await res.json()
      
      if (!res.ok) {
        console.error(`Failed to create plan ${plan.name}:`, JSON.stringify(data))
        results.push({ plan: plan.name, error: data, status: res.status })
      } else {
        console.log(`Created plan ${plan.name}:`, JSON.stringify(data))
        results.push({
          plan: plan.name,
          plan_id: data.id,
          variations: data.variations?.map((v: any) => ({
            id: v.id,
            name: v.name,
            amount: v.phases?.[0]?.amount,
          }))
        })
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
