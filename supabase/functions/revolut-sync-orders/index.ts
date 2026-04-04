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
    // Verify admin auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch orders from Revolut
    const REVOLUT_API_KEY = Deno.env.get('REVOLUT_API_SECRET_KEY')
    if (!REVOLUT_API_KEY) {
      return new Response(JSON.stringify({ error: 'Revolut API not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch recent orders (last 90 days)
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 90)

    const revolutRes = await fetch(
      `${REVOLUT_API_URL}?from_created_date=${fromDate.toISOString()}&limit=500`,
      {
        headers: {
          'Authorization': `Bearer ${REVOLUT_API_KEY}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2024-09-01',
        },
      }
    )

    if (!revolutRes.ok) {
      const errText = await revolutRes.text()
      console.error('Revolut API error:', errText)
      return new Response(JSON.stringify({ error: 'Failed to fetch from Revolut' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const rawData = await revolutRes.json()
    console.log('Revolut response type:', typeof rawData, 'isArray:', Array.isArray(rawData), 'keys:', rawData ? Object.keys(rawData) : 'null')
    
    // Revolut may return array directly or wrapped in an object
    const orders = Array.isArray(rawData) ? rawData : (rawData?.orders || rawData?.items || [rawData]).filter(Boolean)

    // Use service role for DB writes
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let synced = 0
    let updated = 0

    for (const order of orders) {
      const orderId = order.id
      const email = order.email || order.customer?.email || null
      const amount = (order.order_amount?.value || 0) / 100
      const currency = order.order_amount?.currency || 'EUR'
      const state = order.state || 'unknown'
      const createdAt = order.created_at || new Date().toISOString()
      const description = order.description || ''

      // Determine plan from description or merchant ref
      let planName = 'Unknown'
      if (description.includes('Starter')) planName = 'Starter Advertiser'
      else if (description.includes('Growth')) planName = 'Growth Advertiser'
      else if (description.includes('Advanced')) planName = 'Advanced Advertiser'
      else if (order.merchant_order_ext_ref) {
        const ref = order.merchant_order_ext_ref
        if (ref.includes('starter')) planName = 'Starter Advertiser'
        else if (ref.includes('growth')) planName = 'Growth Advertiser'
        else if (ref.includes('advanced')) planName = 'Advanced Advertiser'
      }

      let dbStatus = 'pending'
      if (state === 'COMPLETED') dbStatus = 'completed'
      else if (state === 'FAILED' || state === 'CANCELLED') dbStatus = 'failed'
      else if (state === 'AUTHORISED') dbStatus = 'authorised'

      // Upsert payment
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('revolut_order_id', orderId)
        .maybeSingle()

      if (existingPayment) {
        await supabaseAdmin.from('payments').update({
          status: dbStatus,
          payload: {
            plan: planName,
            amount,
            currency,
            email,
            revolut_state: state,
            synced_at: new Date().toISOString(),
          },
        }).eq('revolut_order_id', orderId)
        updated++
      } else {
        await supabaseAdmin.from('payments').insert({
          revolut_order_id: orderId,
          merchant_ref: order.merchant_order_ext_ref || null,
          status: dbStatus,
          payload: {
            plan: planName,
            amount,
            currency,
            email,
            revolut_state: state,
            synced_at: new Date().toISOString(),
          },
          created_at: createdAt,
        })
        synced++
      }

      // Sync completed orders to customers & subscriptions
      if (dbStatus === 'completed' && email) {
        // Upsert customer
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('id, total_spent, subscription_count')
          .eq('email', email)
          .maybeSingle()

        if (existingCustomer) {
          // Check if this order already counted
          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('revolut_subscription_id', orderId)
            .maybeSingle()

          if (!existingSub) {
            await supabaseAdmin.from('customers').update({
              total_spent: Number(existingCustomer.total_spent) + amount,
              subscription_count: (existingCustomer.subscription_count || 0) + 1,
              last_payment_at: createdAt,
              plan: planName,
              status: 'active',
            }).eq('id', existingCustomer.id)
          }
        } else {
          await supabaseAdmin.from('customers').insert({
            email,
            name: order.customer?.full_name || order.customer?.name || null,
            plan: planName,
            total_spent: amount,
            subscription_count: 1,
            first_payment_at: createdAt,
            last_payment_at: createdAt,
            status: 'active',
          })
        }

        // Upsert subscription
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('revolut_subscription_id', orderId)
          .maybeSingle()

        if (!existingSub) {
          const expiresAt = new Date(createdAt)
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await supabaseAdmin.from('subscriptions').insert({
            customer_email: email,
            customer_name: order.customer?.full_name || order.customer?.name || null,
            plan_name: planName,
            status: 'active',
            amount,
            currency,
            revolut_subscription_id: orderId,
            started_at: createdAt,
            expires_at: expiresAt.toISOString(),
          })
        }
      }
    }

    // Update revenue milestones
    const { data: allSubs } = await supabaseAdmin.from('subscriptions').select('amount')
    const totalRevenue = (allSubs || []).reduce((sum, s) => sum + Number(s.amount || 0), 0)

    const { data: milestones } = await supabaseAdmin
      .from('revenue_milestones')
      .select('*')
      .eq('achieved', false)

    for (const m of milestones || []) {
      await supabaseAdmin.from('revenue_milestones').update({
        current_amount: totalRevenue,
        achieved: totalRevenue >= Number(m.target_amount),
        achieved_at: totalRevenue >= Number(m.target_amount) ? new Date().toISOString() : null,
      }).eq('id', m.id)
    }

    // Also update achieved milestones current_amount
    await supabaseAdmin.from('revenue_milestones').update({
      current_amount: totalRevenue,
    }).eq('achieved', true)

    return new Response(
      JSON.stringify({
        success: true,
        total_orders: orders.length,
        new_synced: synced,
        updated,
        total_revenue: totalRevenue,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ error: 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})